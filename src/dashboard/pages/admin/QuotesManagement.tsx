import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, MoreVertical, Trash } from 'lucide-react';
import { QuoteService } from '../../services/sales/quoteService';
import { useQuery } from '@tanstack/react-query';

export const QuotesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState('All Quotes');

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      return QuoteService.getAllQuotes();
    }
  });

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quote.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentView === 'Drafts') return matchesSearch && quote.status === 'Draft';
    if (currentView === 'Sent to Customer') return matchesSearch && quote.status === 'Sent to Customer';
    if (currentView === 'Accepted') return matchesSearch && quote.status === 'Customer Accepted';
    
    return matchesSearch;
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
      setSelectedQuotes(new Set(filteredQuotes.map(q => q.id)));
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage B2B sales quotations</p>
        </div>
        <button
          onClick={() => navigate('/admin/quotes/new')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          <span>Create Quote</span>
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <select 
          value={currentView}
          onChange={(e) => setCurrentView(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none"
        >
          <option>All Quotes</option>
          <option>Drafts</option>
          <option>Sent to Customer</option>
          <option>Accepted</option>
        </select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search quotes by number or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={20} />
          <span>Filters</span>
        </button>
        {selectedQuotes.size > 0 && (
          <div className="flex items-center gap-2 border-l pl-4">
             <span className="text-sm text-gray-600">{selectedQuotes.size} selected</span>
             <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Export Selected">
               <Download size={20} />
             </button>
             <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete Selected">
               <Trash size={20} />
             </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
             Loading quotes...
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <Search className="h-12 w-12 text-gray-300 mb-4" />
             <h3 className="text-lg font-medium text-gray-900">No quotes found</h3>
             <p className="mt-1">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      checked={selectedQuotes.size === filteredQuotes.length && filteredQuotes.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="p-4 font-medium text-gray-600">Quote #</th>
                  <th className="p-4 font-medium text-gray-600">Company</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600">Date</th>
                  <th className="p-4 font-medium text-gray-600">Total</th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map(quote => (
                  <tr 
                    key={quote.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedQuotes.has(quote.id) ? 'bg-emerald-50/30' : ''}`}
                  >
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        checked={selectedQuotes.has(quote.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleQuoteSelection(quote.id);
                        }}
                      />
                    </td>
                    <td className="p-4 text-emerald-600 font-medium cursor-pointer" onClick={() => navigate(`/admin/quotes/${quote.id}`)}>
                      {quote.quoteNumber}
                    </td>
                    <td className="p-4 font-medium text-gray-900 cursor-pointer" onClick={() => navigate(`/admin/quotes/${quote.id}`)}>
                      {quote.companyName}
                    </td>
                    <td className="p-4 cursor-pointer" onClick={() => navigate(`/admin/quotes/${quote.id}`)}>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs rounded-full font-medium">
                        {quote.status}
                      </span>
                    </td>
                    <td className="p-4 cursor-pointer" onClick={() => navigate(`/admin/quotes/${quote.id}`)}>
                      {new Date(quote.issueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium text-gray-900 cursor-pointer" onClick={() => navigate(`/admin/quotes/${quote.id}`)}>
                      ₹{quote.grandTotal.toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-400 hover:text-gray-600 cursor-pointer">
                       <MoreVertical size={20} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
