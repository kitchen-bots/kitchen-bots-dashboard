import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId('');
    }
  }, [product, isOpen]);

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
          className="relative w-full max-w-2xl bg-popover text-popover-foreground rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border shrink-0 bg-muted/30">
            <div>
              <Heading level="h3">Inventory Management</Heading>
              <Text variant="muted" className="mt-1 text-sm">{product.name} ({product.sku})</Text>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              aria-label="Close inventory modal"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
             <div className="px-6 pt-4 shrink-0 bg-popover">
                <label className="block text-sm font-medium text-foreground mb-1">Select Variant</label>
                <select 
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {product.variants.map(v => (
                    <option key={v.id} value={v.id} className="bg-popover text-foreground">{v.name} ({v.sku})</option>
                  ))}
                </select>
             </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-border px-6 mt-4 shrink-0 bg-popover">
            <button
              type="button"
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview & History
            </button>
            <button
              type="button"
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'adjust' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('adjust')}
            >
              Adjust Stock
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 bg-popover">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/40 p-4 rounded-lg border border-border">
                    <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold mb-1">Available Stock</Text>
                    <Heading level="h2" className={aggregatedInventory.availableStock > 0 ? 'text-emerald-500' : 'text-muted-foreground'}>
                      {loadingInventory ? '...' : aggregatedInventory.availableStock}
                    </Heading>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-lg border border-border">
                    <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold mb-1">Reserved</Text>
                    <Heading level="h2" className="text-amber-500">
                      {loadingInventory ? '...' : aggregatedInventory.reservedStock}
                    </Heading>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-lg border border-border">
                    <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold mb-1">Current Total</Text>
                    <Text className="text-lg font-semibold text-foreground mt-1">
                      {loadingInventory ? '...' : aggregatedInventory.currentStock}
                    </Text>
                  </div>
                </div>

                {/* History */}
                <div>
                  <Text className="text-sm font-semibold mb-4 uppercase tracking-wider text-foreground">Recent Movements</Text>
                  {loadingMovements ? (
                    <Text variant="muted">Loading history...</Text>
                  ) : !movements || movements.length === 0 ? (
                    <div className="text-center py-8 bg-muted/30 rounded-lg border border-border border-dashed">
                      <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <Text variant="muted">No movement history found</Text>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {movements.map((movement: CommerceStockMovement) => (
                        <div key={movement.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${
                              ['IN', 'ADJUSTMENT'].includes(movement.type) ? 'bg-emerald-500/10 text-emerald-500' :
                              ['OUT', 'RESERVE'].includes(movement.type) ? 'bg-rose-500/10 text-rose-500' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {['IN', 'ADJUSTMENT'].includes(movement.type) ? <ArrowDownRight size={16} /> :
                               ['OUT', 'RESERVE'].includes(movement.type) ? <ArrowUpRight size={16} /> :
                               <PackageSearch size={16} />}
                            </div>
                            <div>
                              <Text className="text-sm font-medium text-foreground">{movement.type}</Text>
                              <Text variant="muted" className="text-xs">{movement.notes}</Text>
                            </div>
                          </div>
                          <div className="text-right">
                            <Text className={`font-semibold ${
                              ['IN', 'ADJUSTMENT'].includes(movement.type) ? 'text-emerald-500' :
                              ['OUT', 'RESERVE'].includes(movement.type) ? 'text-rose-500' :
                              'text-foreground'
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
                    <label className="block text-sm font-medium text-foreground mb-1">Movement Type</label>
                    <select
                      {...form.register('type')}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="IN" className="bg-popover text-foreground">Stock In (+)</option>
                      <option value="OUT" className="bg-popover text-foreground">Stock Out (-)</option>
                      <option value="ADJUSTMENT" className="bg-popover text-foreground">Adjustment</option>
                      <option value="RESERVE" className="bg-popover text-foreground">Reserve</option>
                      <option value="RELEASE" className="bg-popover text-foreground">Release</option>
                    </select>
                    {form.formState.errors.type && (
                      <p className="mt-1 text-xs text-destructive">{form.formState.errors.type.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      {...form.register('quantity', { valueAsNumber: true })}
                      placeholder="e.g. 10"
                    />
                    {form.formState.errors.quantity && (
                      <p className="mt-1 text-xs text-destructive">{form.formState.errors.quantity.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Reason/Notes</label>
                  <Input
                    {...form.register('notes')}
                    placeholder="e.g. Received new shipment, Damaged goods, Manual recount"
                  />
                  {form.formState.errors.notes && (
                    <p className="mt-1 text-xs text-destructive">{form.formState.errors.notes.message}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
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
