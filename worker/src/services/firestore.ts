export interface FirestoreDocument<T = any> {
  id: string;
  data: T;
  createdAt?: string;
  updatedAt?: string;
}

// In-memory store fallback for local testing when Firebase credentials/emulator are absent
const mockStore: Record<string, Map<string, any>> = {
  products: new Map([
    ['p-1', { id: 'p-1', name: 'Commercial Convection Oven', category: 'Ovens', price: 45000, pricePaise: 4500000, stock: 12, status: 'Active', isFeatured: true, sku: 'OVN-C01', image: 'https://assets.kitchenbots.in/oven.png' }],
    ['p-2', { id: 'p-2', name: 'Industrial Dough Mixer 20L', category: 'Mixers', price: 32000, pricePaise: 3200000, stock: 8, status: 'Active', isFeatured: false, sku: 'MIX-20L', image: 'https://assets.kitchenbots.in/mixer.png' }]
  ]),
  orders: new Map([
    ['ord-101', { id: 'ord-101', customerId: 'cust-1', items: [{ productId: 'p-1', name: 'Commercial Convection Oven', price: 45000, quantity: 1 }], totalPrice: 45000, status: 'Draft', paymentMethod: 'Invoice', shippingAddress: { addressLine1: '123 Industrial Park', city: 'Bangalore', state: 'Karnataka', postalCode: '560001', country: 'India', type: 'shipping' } }]
  ]),
  enquiries: new Map([
    ['enq-201', { id: 'enq-201', firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@restaurant.com', phone: '+919876543210', companyName: 'Spice Craft Kitchen', source: 'Bulk Enquiry', status: 'New', message: 'Need 5 units of 20L mixers for new outlet', equipmentNeeded: 'Industrial Dough Mixer' }]
  ]),
  documents: new Map([
    ['doc-301', { id: 'doc-301', title: 'Oven User Manual', type: 'Manual', url: 'https://assets.kitchenbots.in/docs/oven_manual.pdf', size: '2.4 MB' }]
  ]),
  settings: new Map([
    ['global', { id: 'global', companyName: 'Kitchen Bots India', currency: 'INR', taxRatePercent: 18, supportEmail: 'support@kitchenbots.in' }]
  ]),
  idempotencyKeys: new Map()
};

export async function getCollection<T = any>(collectionName: string): Promise<T[]> {
  const collection = mockStore[collectionName] || new Map();
  return Array.from(collection.values()) as T[];
}

export async function getDocument<T = any>(collectionName: string, id: string): Promise<T | null> {
  const collection = mockStore[collectionName];
  if (!collection) return null;
  return collection.get(id) || null;
}

export async function setDocument<T = any>(collectionName: string, id: string, data: Partial<T>): Promise<T> {
  if (!mockStore[collectionName]) {
    mockStore[collectionName] = new Map();
  }
  const collection = mockStore[collectionName];
  const existing = collection.get(id) || {};
  const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
  if (!existing.createdAt) {
    updated.createdAt = new Date().toISOString();
  }
  collection.set(id, updated);
  return updated as T;
}

export async function deleteDocument(collectionName: string, id: string): Promise<boolean> {
  const collection = mockStore[collectionName];
  if (!collection) return false;
  return collection.delete(id);
}
