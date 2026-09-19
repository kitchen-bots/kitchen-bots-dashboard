import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ArrowUpRight, ArrowDownRight, PackageSearch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { CommerceProduct, CommerceStockMovement } from '../../types/commerce';
import { CommerceInventoryService } from '../../services/commerce';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Heading, Text } from '../ui/Typography';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CommerceProduct | null;
}

const AdjustStockSchema = z.object({
  type: z.enum(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RESERVE', 'RELEASE'] as const),
  quantity: z.number().positive('Quantity must be greater than 0'),
  notes: z.string().min(1, 'Reason is required')
});

type AdjustStockFormData = z.infer<typeof AdjustStockSchema>;

export function InventoryModal({ isOpen, onClose, product }: InventoryModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'adjust'>('overview');
  
  // Default to first variant if exists
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product?.variants?.[0]?.id || '');

  const { data: inventoryData, isLoading: loadingInventory } = useQuery({
    queryKey: ['inventory', selectedVariantId],
    queryFn: () => selectedVariantId ? CommerceInventoryService.getInventoryForVariant(selectedVariantId) : null,
    enabled: !!selectedVariantId && isOpen,
  });

  const { data: movements, isLoading: loadingMovements } = useQuery({
    queryKey: ['stock_movements', selectedVariantId],
    queryFn: () => selectedVariantId ? CommerceInventoryService.getMovements(selectedVariantId) : [],
    enabled: !!selectedVariantId && isOpen,
  });

  const adjustMutation = useMutation({
    mutationFn: (data: AdjustStockFormData) => 
      CommerceInventoryService.adjustStock(selectedVariantId, 'WH-001', data.quantity, data.type, 'system-user', data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', selectedVariantId] });
      queryClient.invalidateQueries({ queryKey: ['stock_movements', selectedVariantId] });
      setActiveTab('overview');
      form.reset();
    }
  });

  const form = useForm<AdjustStockFormData>({
    resolver: zodResolver(AdjustStockSchema),
    defaultValues: {
      type: 'IN',
      quantity: 1,
      notes: ''
    }
  });

  if (!isOpen || !product) return null;

  // Aggregate inventory across warehouses
  const aggregatedInventory = inventoryData ? inventoryData.reduce((acc, curr) => ({
    currentStock: acc.currentStock + curr.currentStock,
    reservedStock: acc.reservedStock + curr.reservedStock,
    availableStock: acc.availableStock + curr.availableStock,
  }), { currentStock: 0, reservedStock: 0, availableStock: 0 }) : { currentStock: 0, reservedStock: 0, availableStock: 0 };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-default shrink-0 bg-slate-50/50">
            <div>
              <Heading level="h3">Inventory Management</Heading>
              <Text variant="muted" className="mt-1 text-sm">{product.name} ({product.sku})</Text>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
          
          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
             <div className="px-6 pt-4 shrink-0 bg-white">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Variant</label>
                <select 
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-border-default rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {product.variants.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.sku})</option>
                  ))}
                </select>
             </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-border-default px-6 mt-4 shrink-0 bg-white">
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview & History
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'adjust' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('adjust')}
            >
              Adjust Stock
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 bg-white">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-border-default">
                    <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold mb-1">Available Stock</Text>
                    <Heading level="h2" className={aggregatedInventory.availableStock > 0 ? 'text-emerald-600' : 'text-slate-700'}>
                      {loadingInventory ? '...' : aggregatedInventory.availableStock}
                    </Heading>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-border-default">
                    <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold mb-1">Reserved</Text>
                    <Heading level="h2" className="text-amber-600">
                      {loadingInventory ? '...' : aggregatedInventory.reservedStock}
                    </Heading>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-border-default">
                    <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold mb-1">Current Total</Text>
                    <Text className="text-lg font-semibold text-slate-700 mt-1">
                      {loadingInventory ? '...' : aggregatedInventory.currentStock}
                    </Text>
                  </div>
                </div>

                {/* History */}
                <div>
                  <Text className="text-sm font-semibold mb-4 uppercase tracking-wider">Recent Movements</Text>
                  {loadingMovements ? (
                    <Text variant="muted">Loading history...</Text>
                  ) : !movements || movements.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-border-default border-dashed">
                      <PackageSearch className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <Text variant="muted">No movement history found</Text>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {movements.map((movement: CommerceStockMovement) => (
                        <div key={movement.id} className="flex items-center justify-between p-3 border border-border-default rounded-lg bg-white">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              ['IN', 'ADJUSTMENT'].includes(movement.type) ? 'bg-emerald-100 text-emerald-600' :
                              ['OUT', 'RESERVE'].includes(movement.type) ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {['IN', 'ADJUSTMENT'].includes(movement.type) ? <ArrowDownRight size={16} /> :
                               ['OUT', 'RESERVE'].includes(movement.type) ? <ArrowUpRight size={16} /> :
                               <PackageSearch size={16} />}
                            </div>
                            <div>
                              <Text className="text-sm font-medium">{movement.type}</Text>
                              <Text variant="muted" className="text-xs">{movement.notes}</Text>
                            </div>
                          </div>
                          <div className="text-right">
                            <Text className={`font-semibold ${
                              ['IN', 'ADJUSTMENT'].includes(movement.type) ? 'text-emerald-600' :
                              ['OUT', 'RESERVE'].includes(movement.type) ? 'text-red-600' :
                              'text-slate-700'
                            }`}>
                              {['IN', 'ADJUSTMENT'].includes(movement.type) ? '+' :
                               ['OUT', 'RESERVE'].includes(movement.type) ? '-' : ''}
                              {movement.quantity}
                            </Text>
                            <Text variant="muted" className="text-xs">
                              {new Date(movement.timestamp).toLocaleDateString()}
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'adjust' && (
              <form onSubmit={form.handleSubmit((data) => adjustMutation.mutate(data))} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Movement Type</label>
                    <select
                      {...form.register('type')}
                      className="w-full px-3 py-2 bg-white border border-border-default rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="IN">Stock In (+)</option>
                      <option value="OUT">Stock Out (-)</option>
                      <option value="ADJUSTMENT">Adjustment</option>
                      <option value="RESERVE">Reserve</option>
                      <option value="RELEASE">Release</option>
                    </select>
                    {form.formState.errors.type && (
                      <p className="mt-1 text-xs text-red-500">{form.formState.errors.type.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      {...form.register('quantity', { valueAsNumber: true })}
                      placeholder="e.g. 10"
                    />
                    {form.formState.errors.quantity && (
                      <p className="mt-1 text-xs text-red-500">{form.formState.errors.quantity.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason/Notes</label>
                  <Input
                    {...form.register('notes')}
                    placeholder="e.g. Received new shipment, Damaged goods, Manual recount"
                  />
                  {form.formState.errors.notes && (
                    <p className="mt-1 text-xs text-red-500">{form.formState.errors.notes.message}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-border-default flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => setActiveTab('overview')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={adjustMutation.isPending || !selectedVariantId}>
                    {adjustMutation.isPending ? 'Processing...' : 'Confirm Adjustment'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
