import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, FileText } from 'lucide-react';
import { QuoteService } from '../../services/sales/quoteService';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

export const QuotesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState('All Quotes');

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      return QuoteService.getAllQuotes();
    },
  });

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (currentView === 'Drafts') return quote.status === 'Draft';
    if (currentView === 'Sent to Customer') return quote.status === 'Sent to Customer';
    if (currentView === 'Accepted') return quote.status === 'Customer Accepted';

    return true;
  });

  const toggleQuoteSelection = (id: string) => {
    const next = new Set(selectedQuotes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedQuotes(next);
  };

  const toggleAll = () => {
    if (selectedQuotes.size === filteredQuotes.length) {
      setSelectedQuotes(new Set());
    } else {
      setSelectedQuotes(new Set(filteredQuotes.map((q) => q.id)));
    }
  };

  const handleExportSelected = () => {
    const selectedData = quotes.filter((q) => selectedQuotes.has(q.id));
    const blob = new Blob([JSON.stringify(selectedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotes-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer
      title="Sales Quotations"
      description="Create, review, and track B2B commercial proposals and pricing terms."
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Quotes' },
      ]}
      actions={
        <Button onClick={() => navigate('/admin/quotes/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Quote
        </Button>
      }
      className="h-full"
    >
      <div className="space-y-4">
        {/* Controls Toolbar */}
        <Card className="p-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value)}
              className="bg-background border border-input text-foreground text-xs rounded-lg p-2 font-medium outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option>All Quotes</option>
              <option>Drafts</option>
              <option>Sent to Customer</option>
              <option>Accepted</option>
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search quotes by number, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-input text-foreground text-xs rounded-lg pl-9 pr-4 py-2 placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>

            {selectedQuotes.size > 0 && (
              <div className="flex items-center gap-2 border-l border-border pl-3">
                <span className="text-xs text-muted-foreground">{selectedQuotes.size} selected</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleExportSelected}
                  title="Export Selected"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Quotes Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-xs">Loading quotations...</span>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                <FileText className="w-10 h-10 text-muted-foreground/50" />
                <h3 className="text-sm font-semibold text-foreground">No quotes found</h3>
                <p className="text-xs text-muted-foreground">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        className="rounded border-input text-primary focus:ring-ring"
                        checked={selectedQuotes.size === filteredQuotes.length && filteredQuotes.length > 0}
                        onChange={toggleAll}
                        aria-label="Select all quotes"
                      />
                    </TableHead>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Total (INR)</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow
                      key={quote.id}
                      className={selectedQuotes.has(quote.id) ? 'bg-primary/5' : undefined}
                    >
                      <TableCell className="w-10">
                        <input
                          type="checkbox"
                          className="rounded border-input text-primary focus:ring-ring"
                          checked={selectedQuotes.has(quote.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleQuoteSelection(quote.id);
                          }}
                          aria-label={`Select quote ${quote.quoteNumber}`}
                        />
                      </TableCell>
                      <TableCell
                        className="font-mono text-xs font-semibold text-primary cursor-pointer hover:underline"
                        onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                      >
                        {quote.quoteNumber}
                      </TableCell>
                      <TableCell
                        className="text-xs font-medium text-foreground cursor-pointer"
                        onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                      >
                        {quote.companyName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            quote.status === 'Draft'
                              ? 'secondary'
                              : quote.status === 'Sent to Customer'
                              ? 'warning'
                              : quote.status === 'Customer Accepted'
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {quote.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(quote.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        ₹{quote.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                          title="View Quote Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default QuotesManagement;
