import { describe, it, expect } from 'vitest';
import { CommerceInventoryService } from '../InventoryService';

describe('CommerceInventoryService', () => {
  it('should get a list of warehouses', async () => {
    const warehouses = await CommerceInventoryService.getWarehouses();
    expect(warehouses).toBeInstanceOf(Array);
    expect(warehouses.length).toBeGreaterThan(0);
    expect(warehouses[0].id).toBe('WH-001');
  });

  it('should get inventory for a specific variant', async () => {
    const inventory = await CommerceInventoryService.getInventoryForVariant('VAR-001-NG');
    expect(inventory).toBeInstanceOf(Array);
    expect(inventory.length).toBeGreaterThan(0);
    expect(inventory[0].variantId).toBe('VAR-001-NG');
  });

  it('should get inventory by warehouse', async () => {
    const inventory = await CommerceInventoryService.getInventoryByWarehouse('WH-001');
    expect(inventory).toBeInstanceOf(Array);
    expect(inventory.length).toBeGreaterThan(0);
    expect(inventory.every(i => i.warehouseId === 'WH-001')).toBe(true);
  });

  it('should adjust stock correctly (IN)', async () => {
    // Initial stock adjustment for a new variant
    const variantId = 'TEST-VAR-IN';
    const warehouseId = 'WH-001';
    
    const newInventory = await CommerceInventoryService.adjustStock(
      variantId, warehouseId, 10, 'IN', 'user-1'
    );
    
    expect(newInventory.currentStock).toBe(10);
    expect(newInventory.availableStock).toBe(10);
    expect(newInventory.status).toBe('In_Stock');
    
    const movements = await CommerceInventoryService.getMovements(variantId);
    expect(movements.length).toBe(1);
    expect(movements[0].type).toBe('IN');
    expect(movements[0].quantity).toBe(10);
  });

  it('should adjust stock correctly (OUT)', async () => {
    const variantId = 'TEST-VAR-OUT';
    const warehouseId = 'WH-001';
    
    // First add some stock
    await CommerceInventoryService.adjustStock(variantId, warehouseId, 20, 'IN', 'user-1');
    
    // Then take some out
    const updatedInventory = await CommerceInventoryService.adjustStock(
      variantId, warehouseId, 5, 'OUT', 'user-1'
    );
    
    expect(updatedInventory.currentStock).toBe(15);
    expect(updatedInventory.availableStock).toBe(15);
  });

  it('should throw error when insufficient stock for OUT', async () => {
    const variantId = 'TEST-VAR-ERR';
    const warehouseId = 'WH-001';
    
    await expect(
      CommerceInventoryService.adjustStock(variantId, warehouseId, 50, 'OUT', 'user-1')
    ).rejects.toThrow('Insufficient stock');
  });

  it('should handle RESERVE and RELEASE correctly', async () => {
    const variantId = 'TEST-VAR-RES';
    const warehouseId = 'WH-001';
    
    // Add stock
    await CommerceInventoryService.adjustStock(variantId, warehouseId, 10, 'IN', 'user-1');
    
    // Reserve stock
    const reservedInventory = await CommerceInventoryService.adjustStock(
      variantId, warehouseId, 3, 'RESERVE', 'user-1'
    );
    
    expect(reservedInventory.currentStock).toBe(10);
    expect(reservedInventory.reservedStock).toBe(3);
    expect(reservedInventory.availableStock).toBe(7);

    // Release stock
    const releasedInventory = await CommerceInventoryService.adjustStock(
      variantId, warehouseId, 1, 'RELEASE', 'user-1'
    );
    
    expect(releasedInventory.currentStock).toBe(10);
    expect(releasedInventory.reservedStock).toBe(2);
    expect(releasedInventory.availableStock).toBe(8);
  });
});
