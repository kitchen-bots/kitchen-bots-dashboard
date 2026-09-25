import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuoteService } from '../../services/sales/quoteService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';

export const AddQuote: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstDetails: '',
    notes: '',
  });

  const [items, setItems] = useState([
    { productId: 'prod-1', variantId: 'VAR-001-NG', productName: 'Commercial BBQ Grill', sku: 'KB-SM-001', unitPrice: 18000, quantity: 1 }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim() || !formData.contactPerson.trim() || !formData.email.trim()) {
      toast.error('Please fill in all required customer details');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one line item to the quote');
      return;
    }

    for (const item of items) {
      if (!item.productName.trim()) {
        toast.error('Product description is required for all line items');
        return;
      }
      if (item.quantity <= 0) {
        toast.error('Quantity must be greater than 0');
        return;
      }
      if (item.unitPrice < 0) {
        toast.error('Unit price cannot be negative');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const quote = QuoteService.createQuote(
        {
          customerId: `cust-${Date.now()}`,
          companyName: formData.companyName.trim(),
          contactPerson: formData.contactPerson.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          gstDetails: formData.gstDetails.trim() || undefined,
          notes: formData.notes.trim() || undefined,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: 'prod-2', variantId: 'VAR-PROD-2-STD', productName: 'Rocket Stove (Single Burner)', sku: 'KB-RS-002', unitPrice: 8500, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('Quote must contain at least one line item');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin/quotes')}
              className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Quotes
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Quotation</h1>
            <p className="text-sm text-muted-foreground mt-1">Generate a structured quotation for enterprise sales</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Primary recipient and contact person information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Company Name *</label>
                  <input 
                    required 
                    type="text" 
                    name="companyName" 
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:ring-1 focus:ring-ring outline-none" 
                    value={formData.companyName} 
                    onChange={e => setFormData({...formData, companyName: e.target.value})} 
                    placeholder="e.g. Spice Route Hospitality"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Contact Person *</label>
                  <input 
                    required 
                    type="text" 
                    name="contactPerson" 
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:ring-1 focus:ring-ring outline-none" 
                    value={formData.contactPerson} 
                    onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Email *</label>
                  <input 
                    required 
                    type="email" 
                    name="email" 
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:ring-1 focus:ring-ring outline-none" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    placeholder="e.g. procurement@spiceroute.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Phone</label>
                  <input 
                    type="text" 
                    name="phone" 
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:ring-1 focus:ring-ring outline-none" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    name="gstDetails"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:ring-1 focus:ring-ring outline-none"
                    value={formData.gstDetails}
                    onChange={e => setFormData({...formData, gstDetails: e.target.value})}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Equipment products and custom configurations</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1.5" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-muted/40 p-3 rounded-lg border border-border">
                    <div className="flex-1 w-full">
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Product Description</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-ring" 
                        value={item.productName} 
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].productName = e.target.value;
                          setItems(newItems);
                        }} 
                      />
                    </div>
                    <div className="w-full sm:w-28">
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Quantity</label>
                      <input 
                        type="number" 
                        min="1" 
                        required
                        className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-ring" 
                        value={item.quantity} 
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].quantity = parseInt(e.target.value) || 1;
                          setItems(newItems);
                        }} 
                      />
                    </div>
                    <div className="w-full sm:w-36">
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Unit Price (₹)</label>
                      <input 
                        type="number" 
                        min="0" 
                        required
                        className="w-full px-3 py-1.5 bg-background border border-input rounded-md text-sm text-foreground outline-none focus:ring-1 focus:ring-ring" 
                        value={item.unitPrice} 
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                          setItems(newItems);
                        }} 
                      />
                    </div>
                    <div className="pt-2 sm:pt-4">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeItem(index)} 
                        disabled={items.length <= 1}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/quotes')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                'Create Quote'
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};

export default AddQuote;
