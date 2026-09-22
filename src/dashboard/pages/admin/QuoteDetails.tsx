import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuoteService } from '../../services/sales/quoteService';
import { OrderService } from '../../services/sales/orderService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, CheckCircle, Send, XCircle, ShoppingBag } from 'lucide-react';
import { QuoteStatus } from '../../types/sales';
import { TimelineService } from '../../services/sales/timelineService';
import { Timeline } from '../../components/ui/Timeline';

export const QuoteDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use state to force re-render when quote updates
  const [quote, setQuote] = useState(() => QuoteService.getQuote(id || ''));
  const [events, setEvents] = useState(() => TimelineService.getEventsForEntity(id || ''));

  if (!quote) {
    return (
      <PageContainer>
        <div className="p-8 text-center text-muted-foreground">Quote not found</div>
      </PageContainer>
    );
  }

  const handleStatusChange = (newStatus: QuoteStatus) => {
    try {
      const updated = QuoteService.updateStatus(quote.id, newStatus, user?.id || 'admin', user?.name || 'Admin');
      setQuote(updated);
      setEvents(TimelineService.getEventsForEntity(quote.id));
      toast.success(`Quote moved to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleConvertToOrder = () => {
    try {
      const order = OrderService.createOrderFromQuote(quote, user?.id || 'admin', user?.name || 'Admin');
      const updatedQuote = QuoteService.updateStatus(quote.id, 'Converted to Order', user?.id || 'admin', user?.name || 'Admin');
      setQuote(updatedQuote);
      setEvents(TimelineService.getEventsForEntity(quote.id));
      toast.success('Successfully converted to order!');
      navigate(`/admin/orders/${order.id}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/admin/quotes')}
              className="h-9 w-9"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{quote.quoteNumber}</h1>
                <Badge variant="outline">{quote.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Version {quote.versionNumber} • {quote.companyName}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Configured products and pricing details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {quote.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">₹{item.pricing.unitPrice.toLocaleString()} × {item.pricing.quantity}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Tax: ₹{item.pricing.taxAmount.toFixed(2)}</p>
                      </div>
                      <div className="text-right text-sm font-semibold text-foreground">
                        ₹{item.pricing.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 border-t border-border pt-4 space-y-1.5 text-right text-sm">
                  <p className="text-muted-foreground">Subtotal: <span className="font-medium text-foreground">₹{quote.subtotal.toFixed(2)}</span></p>
                  <p className="text-muted-foreground">Tax (18%): <span className="font-medium text-foreground">₹{quote.totalTax.toFixed(2)}</span></p>
                  <p className="text-base font-bold text-foreground pt-1 border-t border-border/50">Grand Total: ₹{quote.grandTotal.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Pipeline workflow management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {quote.status === 'Draft' && (
                    <Button onClick={() => handleStatusChange('Sent to Customer')} className="w-full">
                      <Send className="w-4 h-4 mr-2" /> Send to Customer
                    </Button>
                  )}
                  
                  {['Sent to Customer', 'Customer Viewed'].includes(quote.status) && (
                    <>
                      <Button onClick={() => handleStatusChange('Customer Accepted')} className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Accepted
                      </Button>
                      <Button onClick={() => handleStatusChange('Customer Rejected')} variant="destructive" className="w-full">
                        <XCircle className="w-4 h-4 mr-2" /> Mark Rejected
                      </Button>
                    </>
                  )}

                  {quote.status === 'Customer Accepted' && (
                    <Button onClick={handleConvertToOrder} className="w-full">
                      <ShoppingBag className="w-4 h-4 mr-2" /> Convert to Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium text-foreground">{quote.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground">{quote.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-foreground">{quote.phone || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline events={events} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
