import { CommerceInventory, CommerceStockMovement, CommerceWarehouse } from '../../types/commerce';
import { INITIAL_WAREHOUSES, INITIAL_INVENTORY } from '../../data/catalog';

const mockWarehouses: CommerceWarehouse[] = [...INITIAL_WAREHOUSES];
const mockInventory: CommerceInventory[] = [...INITIAL_INVENTORY];
const mockMovements: CommerceStockMovement[] = [];

export const CommerceInventoryService = {
  getWarehouses: async (): Promise<CommerceWarehouse[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...mockWarehouses];
  },

  getInventoryForVariant: async (variantId: string): Promise<CommerceInventory[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockInventory.filter(i => i.variantId === variantId);
  },

  getInventoryByWarehouse: async (warehouseId: string): Promise<CommerceInventory[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockInventory.filter(i => i.warehouseId === warehouseId);
  },

  adjustStock: async (
    variantId: string, 
    warehouseId: string, 
    quantity: number, 
    type: CommerceStockMovement['type'], 
    userId: string, 
    notes?: string
  ): Promise<CommerceInventory> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let inv = mockInventory.find(i => i.variantId === variantId && i.warehouseId === warehouseId);
    
    if (!inv) {
      // Create new inventory record if it doesn't exist
      inv = {
        id: `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        variantId,
        warehouseId,
        currentStock: 0,
        reservedStock: 0,
        availableStock: 0,
        minimumStock: 0,
        reorderLevel: 0,
        status: 'Out_Of_Stock',
      };
      mockInventory.push(inv);
    }
    
    const previousStock = inv.currentStock;
    
    if (type === 'IN') {
      inv.currentStock += quantity;
    } else if (type === 'OUT') {
      if (inv.currentStock < quantity) throw new Error('Insufficient stock');
      inv.currentStock -= quantity;
    } else if (type === 'RESERVE') {
      if (inv.availableStock < quantity) throw new Error('Insufficient available stock');
      inv.reservedStock += quantity;
    } else if (type === 'RELEASE') {
      if (inv.reservedStock < quantity) throw new Error('Insufficient reserved stock');
      inv.reservedStock -= quantity;
    } else if (type === 'ADJUSTMENT') {
      // positive or negative
      inv.currentStock += quantity;
      if (inv.currentStock < 0) inv.currentStock = 0;
    }
    
    inv.availableStock = inv.currentStock - inv.reservedStock;
    inv.lastCountAt = new Date().toISOString();
    
    // Update status based on levels
    if (inv.availableStock <= 0) inv.status = 'Out_Of_Stock';
    else if (inv.availableStock <= inv.reorderLevel) inv.status = 'Low_Stock';
    else inv.status = 'In_Stock';
    
    // Record movement
    const movement: CommerceStockMovement = {
      id: `MOV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      variantId,
      warehouseId,
      type,
      quantity,
      timestamp: new Date().toISOString(),
      userId,
      notes: notes || `Stock adjusted from ${previousStock} to ${inv.currentStock}`
    };
    mockMovements.push(movement);
    
    return inv;
  },
  
  getMovements: async (variantId?: string): Promise<CommerceStockMovement[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (variantId) {
      return mockMovements.filter(m => m.variantId === variantId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return [...mockMovements].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};
