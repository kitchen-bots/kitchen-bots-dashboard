import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuoteService } from '../../services/sales/quoteService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2 } from 'lucide-react';

export const AddQuote: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
  });

  const [items, setItems] = useState([
    { productId: 'PROD-1', variantId: 'VAR-1', productName: 'Commercial Oven', sku: 'OVEN-001', unitPrice: 5000, quantity: 1 }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quote = QuoteService.createQuote(
        {
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          salesRepId: user?.id || 'admin',
          items: items.map(item => ({
            id: crypto.randomUUID(),
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            sku: item.sku,
            pricing: {
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              discountAmount: 0,
              taxRate: 18,
              taxAmount: (item.unitPrice * item.quantity) * 0.18,
              subtotal: item.unitPrice * item.quantity,
              total: (item.unitPrice * item.quantity) * 1.18,
            }
          })),
          currency: 'INR',
          issueDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          totalDiscount: 0,
          totalTax: items.reduce((acc, item) => acc + (item.unitPrice * item.quantity) * 0.18, 0),
          shippingCost: 0,
          attachments: [],
        },
        user?.id || 'admin',
        user?.name || 'Admin User'
      );
      toast.success('Quote created successfully!');
      navigate(`/admin/quotes/${quote.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create quote');
    }
  };

  const addItem = () => {
    setItems([...items, { productId: 'PROD-2', variantId: 'VAR-2', productName: 'Prep Table', sku: 'PT-002', unitPrice: 2000, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create Quote</h1>
          <p className="text-sm text-gray-500">Generate a new quotation for a customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Customer Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input required type="text" name="companyName" className="w-full border p-2 rounded" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input required type="text" name="contactPerson" className="w-full border p-2 rounded" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" name="email" className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Line Items</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700">
              <Plus size={16} /> Add Item
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                  <input type="text" className="w-full border p-2 rounded text-sm" value={item.productName} onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].productName = e.target.value;
                    setItems(newItems);
                  }} />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                  <input type="number" min="1" className="w-full border p-2 rounded text-sm" value={item.quantity} onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].quantity = parseInt(e.target.value);
                    setItems(newItems);
                  }} />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Unit Price</label>
                  <input type="number" min="0" className="w-full border p-2 rounded text-sm" value={item.unitPrice} onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].unitPrice = parseFloat(e.target.value);
                    setItems(newItems);
                  }} />
                </div>
                <button type="button" onClick={() => removeItem(index)} className="mt-5 p-2 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/quotes')} className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Create Quote</button>
        </div>
      </form>
    </div>
  );
};
