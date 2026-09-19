import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, MoreVertical, Trash } from 'lucide-react';
import { OrderService } from '../../services/sales/orderService';
import { useQuery } from '@tanstack/react-query';

export const AdminOrdersManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState('All Orders');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => {
      return OrderService.getAllOrders();
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentView === 'Pending Approval') return matchesSearch && order.status === 'Pending Approval';
    if (currentView === 'Processing') return matchesSearch && ['Processing', 'Inventory Reserved', 'Packed'].includes(order.status);
    if (currentView === 'Shipped') return matchesSearch && order.status === 'Shipped';
    
    return matchesSearch;
  });

  const toggleOrderSelection = (id: string) => {
    const next = new Set(selectedOrders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOrders(next);
  };

  const toggleAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all B2B orders and fulfillments</p>
        </div>
        <button
          onClick={() => navigate('/admin/orders/new')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          <span>Create Order</span>
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <select 
          value={currentView}
          onChange={(e) => setCurrentView(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none"
        >
          <option>All Orders</option>
          <option>Pending Approval</option>
          <option>Processing</option>
          <option>Shipped</option>
        </select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders by number or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={20} />
          <span>Filters</span>
        </button>
        {selectedOrders.size > 0 && (
          <div className="flex items-center gap-2 border-l pl-4">
             <span className="text-sm text-gray-600">{selectedOrders.size} selected</span>
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
             Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <Search className="h-12 w-12 text-gray-300 mb-4" />
             <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
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
                      checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="p-4 font-medium text-gray-600">Order #</th>
                  <th className="p-4 font-medium text-gray-600">Company</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600">Payment</th>
                  <th className="p-4 font-medium text-gray-600">Fulfillment</th>
                  <th className="p-4 font-medium text-gray-600">Total</th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr 
                    key={order.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedOrders.has(order.id) ? 'bg-emerald-50/30' : ''}`}
                  >
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        checked={selectedOrders.has(order.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleOrderSelection(order.id);
                        }}
                      />
                    </td>
                    <td className="p-4 text-emerald-600 font-medium cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                      {order.orderNumber}
                    </td>
                    <td className="p-4 font-medium text-gray-900 cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                      {order.companyName}
                    </td>
                    <td className="p-4 cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-100 text-xs rounded-full font-medium">
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">{order.paymentStatus}</td>
                    <td className="p-4">{order.shippingStatus}</td>
                    <td className="p-4 font-medium text-gray-900">₹{order.grandTotal.toFixed(2)}</td>
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
