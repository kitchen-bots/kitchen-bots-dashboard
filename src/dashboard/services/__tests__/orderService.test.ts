import { describe, it, expect } from 'vitest';
import { orderService } from '../orderService';
import { OrderService as SalesOrderService } from '../sales/orderService';

describe('orderService', () => {
  it('should retrieve orders with fallback data when backend is unconfigured', async () => {
    const response = await orderService.getOrders();
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.total).toBeGreaterThan(0);
  });

  it('should filter orders by status', async () => {
    const response = await orderService.getOrders({ status: 'shipped' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.every((o) => o.status === 'shipped')).toBe(true);
  });

  it('should filter orders by search query', async () => {
    const response = await orderService.getOrders({ search: 'Rohan' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].customer?.name).toContain('Rohan');
  });

  it('should retrieve an order by ID', async () => {
    const order = await orderService.getOrderById('ORD-1001');
    expect(order).toBeDefined();
    expect(order.id).toBe('ORD-1001');
    expect(order.items.length).toBe(2);
  });

  it('should successfully create an order with fallback offline without throwing', async () => {
    const newOrderPayload = {
      customerId: 'CUST-TEST-1',
      customer: {
        id: 'CUST-TEST-1',
        name: 'Grand Hyatt Kitchens',
        email: 'procurement@hyatt.test',
        phone: '+91 99887 76655',
        role: 'customer' as const,
        addresses: [],
        wishlist: [],
        status: 'active' as const,
        createdAt: new Date().toISOString(),
      },
      totalPrice: 118000,
      paymentMethod: 'Credit Card',
      status: 'pending' as const,
      items: [
        {
          id: 'ITEM-TEST-1',
          productId: 'prod-1',
          name: 'Commercial BBQ Grill',
          quantity: 1,
          price: 85000,
        },
      ],
      shippingAddress: {
        id: 'ADDR-TEST-1',
        type: 'shipping' as const,
        addressLine1: 'Road No 12, Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500034',
        country: 'India',
      },
    };

    const created = await orderService.createOrder(newOrderPayload);
    expect(created).toBeDefined();
    expect(created.id).toMatch(/^ORD-/);
    expect(created.customerId).toBe('CUST-TEST-1');
    expect(created.totalPrice).toBe(118000);

    // Verify it is retrievable via getOrderById
    const fetched = await orderService.getOrderById(created.id);
    expect(fetched).toBeDefined();
    expect(fetched.id).toBe(created.id);
  });

  it('should update order status', async () => {
    const updated = await orderService.updateOrderStatus('ORD-1003', 'delivered');
    expect(updated).toBeDefined();
    expect(updated.status).toBe('delivered');
  });

  it('should delete an order', async () => {
    const initialOrders = await orderService.getOrders();
    const countBefore = initialOrders.total;

    await orderService.deleteOrder('ORD-1004');

    const remainingOrders = await orderService.getOrders();
    expect(remainingOrders.total).toBe(countBefore - 1);
  });
});

describe('SalesOrderService (Commercial Admin ERP)', () => {
  it('should have initial commercial orders seeded for Admin Orders Management', () => {
    const orders = SalesOrderService.getAllOrders();
    expect(orders).toBeInstanceOf(Array);
    expect(orders.length).toBeGreaterThan(0);

    const pendingOrder = orders.find((o) => o.status === 'Pending Approval');
    expect(pendingOrder).toBeDefined();
  });

  it('should transition commercial order state machine cleanly', () => {
    const order = SalesOrderService.getOrder('ord-comm-1');
    expect(order).toBeDefined();
    expect(order?.status).toBe('Pending Approval');

    const approved = SalesOrderService.updateStatus(
      'ord-comm-1',
      'Approved',
      'admin-1',
      'Operations Admin',
      'Credit line verified'
    );
    expect(approved.status).toBe('Approved');
  });
});
