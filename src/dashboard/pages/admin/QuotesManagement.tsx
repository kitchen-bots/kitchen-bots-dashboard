import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, FileText, CheckCircle2, Send, Clock, ChevronDown } from 'lucide-react';
import { QuoteService } from '../../services/sales/quoteService';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Text } from '../../components/ui/Typography';

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
      homeHref="/admin"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Quotes' },
      ]}
      actions={
        <Button type="button" onClick={() => navigate('/admin/quotes/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Quote
        </Button>
      }
      className="h-full"
    >
      <div className="flex flex-col gap-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText size={20} />
                </div>
                <Badge variant="default">All</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Total Quotes</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">{quotes.length}</Text>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock size={20} />
                </div>
                <Badge variant="secondary">Draft</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Draft Proposals</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">
                {quotes.filter((q) => q.status === 'Draft').length}
              </Text>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Send size={20} />
                </div>
                <Badge variant="warning">Sent</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Awaiting Decision</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">
                {quotes.filter((q) => q.status === 'Sent to Customer').length}
              </Text>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={20} />
                </div>
                <Badge variant="default">Won</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Accepted Value</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">
                ₹{quotes.filter((q) => q.status === 'Customer Accepted').reduce((acc, q) => acc + (q.grandTotal || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
            </CardContent>
          </Card>
        </div>

        {/* Controls Toolbar */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative">
                <select
                  value={currentView}
                  onChange={(e) => setCurrentView(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-background border border-input text-foreground text-xs rounded-lg font-medium outline-hidden focus:ring-1 focus:ring-ring appearance-none cursor-pointer h-9"
                >
                  <option>All Quotes</option>
                  <option>Drafts</option>
                  <option>Sent to Customer</option>
                  <option>Accepted</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none w-3.5 h-3.5" />
              </div>

              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search quotes by number, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background border border-input text-foreground text-xs rounded-lg pl-9 pr-4 py-2 placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-ring h-9"
                />
              </div>
            </div>

            {selectedQuotes.size > 0 && (
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{selectedQuotes.size} selected</span>
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
        <Card className="overflow-hidden">
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="w-10 px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-input text-primary focus:ring-ring"
                          checked={selectedQuotes.size === filteredQuotes.length && filteredQuotes.length > 0}
                          onChange={toggleAll}
                          aria-label="Select all quotes"
                        />
                      </TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Quote #</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Company</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Status</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Issue Date</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Total (INR)</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => (
                      <TableRow
                        key={quote.id}
                        className={`hover:bg-muted/40 border-b border-border/50 ${selectedQuotes.has(quote.id) ? 'bg-primary/5' : ''}`}
                      >
                        <TableCell className="w-10 px-4 py-3 whitespace-nowrap">
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
                          className="font-mono text-xs font-semibold text-primary cursor-pointer hover:underline px-4 py-3 whitespace-nowrap"
                          onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                        >
                          {quote.quoteNumber}
                        </TableCell>
                        <TableCell
                          className="text-xs font-medium text-foreground cursor-pointer px-4 py-3 whitespace-nowrap truncate max-w-[180px]"
                          onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                        >
                          {quote.companyName}
                        </TableCell>
                        <TableCell className="px-4 py-3 whitespace-nowrap">
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
                        <TableCell className="text-xs text-muted-foreground px-4 py-3 whitespace-nowrap">
                          {new Date(quote.issueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground px-4 py-3 whitespace-nowrap">
                          ₹{quote.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right px-4 py-3 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => navigate(`/admin/quotes/${quote.id}`)}
                            title="View Quote Details"
                            aria-label={`View quote ${quote.quoteNumber}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default QuotesManagement;
