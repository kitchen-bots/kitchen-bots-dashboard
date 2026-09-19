import { Link, useLocation } from 'react-router-dom';
import { BarChart, ChevronLeft, ChevronRight, FileWarning, MessageSquare, Microwave, Package, PlusCircle, Receipt, Truck, User, UserPlus, Wrench, IndianRupee, ShoppingBasket, UploadCloud, Soup, Coffee } from 'lucide-react';

export const DashboardHome = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const basePath = isAdmin ? '/admin' : '/customer';

  return (
    <div className="h-full flex flex-col space-y-8 pb-8">
      <div className="shrink-0 space-y-8">
        {/* Hero */}
      <section className="py-6">
        <h1 className="text-slate-900 mb-2 font-bold text-3xl">Welcome back, Raj 👋</h1>
        <p className="text-lg text-slate-500">KitchenBots operations are running smoothly.</p>
      </section>

      {/* Top Analytics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 flex flex-col gap-2 hover:translate-y-[-4px] transition-transform">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-full bg-primary-500/10 text-primary-600"><IndianRupee className="w-5 h-5" /></span>
            <span className="text-xs font-bold text-primary-600">+12%</span>
          </div>
          <p className="text-slate-500 text-sm">Total Revenue</p>
          <h3 className="text-2xl font-bold">₹4.2M</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 flex flex-col gap-2 hover:translate-y-[-4px] transition-transform">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-full bg-blue-100 text-blue-700"><ShoppingBasket className="w-5 h-5" /></span>
            <span className="text-xs font-bold text-blue-600">+8.4%</span>
          </div>
          <p className="text-slate-500 text-sm">Total Orders</p>
          <h3 className="text-2xl font-bold">1,284</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 flex flex-col gap-2 hover:translate-y-[-4px] transition-transform">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-full bg-purple-100 text-purple-800"><Package className="w-5 h-5" /></span>
            <span className="text-xs font-bold text-purple-600">24 New</span>
          </div>
          <p className="text-slate-500 text-sm">Products</p>
          <h3 className="text-2xl font-bold">458</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 flex flex-col gap-2 hover:translate-y-[-4px] transition-transform">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-full bg-primary-100 text-primary-800"><User className="w-5 h-5" /></span>
            <span className="text-xs font-bold text-primary-600">Active</span>
          </div>
          <p className="text-slate-500 text-sm">Active Users</p>
          <h3 className="text-2xl font-bold">8.2k</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 flex flex-col gap-2 hover:translate-y-[-4px] transition-transform">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-full bg-[#E8DEFF] text-[#625B71]"><Wrench className="w-5 h-5" /></span>
            <span className="text-xs font-bold text-rose-600">12 High</span>
          </div>
          <p className="text-slate-500 text-sm">Pending Services</p>
          <h3 className="text-2xl font-bold">42</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 flex flex-col gap-2 hover:translate-y-[-4px] transition-transform">
          <div className="flex justify-between items-start">
            <span className="p-2 rounded-full bg-slate-100 text-slate-500"><UploadCloud className="w-5 h-5" /></span>
            <span className="text-xs font-bold text-slate-500">Update</span>
          </div>
          <p className="text-slate-500 text-sm">Documents</p>
          <h3 className="text-2xl font-bold">156</h3>
        </div>
      </section>

      </div>

      {/* Main Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left Main Column (Charts & Lists) */}
        <div className="col-span-1 lg:col-span-8 space-y-8 pr-2 pb-8">
          
          {/* Revenue Growth Chart Placeholder */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl border border-slate-200/60 shadow-md overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold">Revenue Growth</h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-full bg-slate-50 text-slate-500 text-sm hover:bg-primary-500 hover:text-white transition-colors">Weekly</button>
                <button className="px-4 py-2 rounded-full bg-primary-500 text-white text-sm font-bold">Monthly</button>
              </div>
            </div>
            
            <div className="h-64 relative flex items-end gap-2 px-4">
              <div className="absolute inset-x-4 inset-y-0 flex items-center justify-center opacity-10">
                <div className="w-full h-full border-b-2 border-primary-500 border-dashed"></div>
              </div>
              <div className="w-full h-48 bg-gradient-to-t from-primary-500/20 to-transparent rounded-t-lg relative group cursor-pointer hover:from-primary-500/30 transition-all">
                <div className="absolute -top-1 w-full h-1 bg-primary-500 rounded-full"></div>
                <div className="hidden group-hover:flex absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded">₹340k</div>
              </div>
              <div className="w-full h-32 bg-gradient-to-t from-blue-100/40 to-transparent rounded-t-lg relative hover:from-blue-100/60 transition-all"></div>
              <div className="w-full h-56 bg-gradient-to-t from-primary-500/20 to-transparent rounded-t-lg relative hover:from-primary-500/30 transition-all">
                <div className="absolute -top-1 w-full h-1 bg-primary-500 rounded-full"></div>
              </div>
              <div className="w-full h-40 bg-gradient-to-t from-blue-100/40 to-transparent rounded-t-lg relative hover:from-blue-100/60 transition-all"></div>
              <div className="w-full h-64 bg-gradient-to-t from-primary-500/20 to-transparent rounded-t-lg relative hover:from-primary-500/30 transition-all">
                <div className="absolute -top-1 w-full h-1 bg-primary-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex justify-between mt-4 px-4 text-slate-500 text-sm">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>

          {/* Recent Orders & Activity Heatmap Bento Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl border border-slate-200/60 shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Recent Orders</h3>
                <button className="text-primary-600 text-sm font-bold">View All</button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Soup className="text-blue-700 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">KitchenPro X1</p>
                      <p className="text-xs text-slate-500">#KB-1204</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 text-[10px] font-bold rounded-full tracking-wider">SHIPPED</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Microwave className="text-purple-800 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">GrillMaster 3000</p>
                      <p className="text-xs text-slate-500">#KB-1205</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full tracking-wider">PROCESSING</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      <Coffee className="text-slate-900 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">UltraMix XL</p>
                      <p className="text-xs text-slate-500">#KB-1206</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full tracking-wider">PENDING</span>
                </div>
              </div>
            </div>

            {/* User Activity Heatmap */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl border border-slate-200/60 shadow-md">
              <h3 className="text-2xl font-bold mb-6">User Activity</h3>
              <div className="grid grid-cols-7 gap-2">
                <div className="h-8 rounded bg-primary-500/20"></div><div className="h-8 rounded bg-primary-500/40"></div><div className="h-8 rounded bg-primary-500/10"></div><div className="h-8 rounded bg-primary-500/60"></div><div className="h-8 rounded bg-primary-500/80"></div><div className="h-8 rounded bg-primary-500/30"></div><div className="h-8 rounded bg-primary-500/50"></div>
                <div className="h-8 rounded bg-primary-500/60"></div><div className="h-8 rounded bg-primary-500/10"></div><div className="h-8 rounded bg-primary-500/90"></div><div className="h-8 rounded bg-primary-500/40"></div><div className="h-8 rounded bg-primary-500/20"></div><div className="h-8 rounded bg-primary-500/70"></div><div className="h-8 rounded bg-primary-500/30"></div>
                <div className="h-8 rounded bg-primary-500/20"></div><div className="h-8 rounded bg-primary-500/50"></div><div className="h-8 rounded bg-primary-500/30"></div><div className="h-8 rounded bg-primary-500/10"></div><div className="h-8 rounded bg-primary-500/60"></div><div className="h-8 rounded bg-primary-500/80"></div><div className="h-8 rounded bg-primary-500/40"></div>
                <div className="h-8 rounded bg-primary-500/10"></div><div className="h-8 rounded bg-primary-500/30"></div><div className="h-8 rounded bg-primary-500/60"></div><div className="h-8 rounded bg-primary-500/40"></div><div className="h-8 rounded bg-primary-500/90"></div><div className="h-8 rounded bg-primary-500/20"></div><div className="h-8 rounded bg-primary-500/50"></div>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>

          {/* Product Performance */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl border border-slate-200/60 shadow-md">
            <h3 className="text-2xl font-bold mb-6">Product Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200/30 text-sm text-slate-500">
                  <tr>
                    <th className="pb-4 font-medium">Product Name</th>
                    <th className="pb-4 font-medium">Category</th>
                    <th className="pb-4 font-medium">Sales</th>
                    <th className="pb-4 font-medium">Stock</th>
                    <th className="pb-4 font-medium">Performance</th>
                  </tr>
                </thead>
                <tbody className="text-base">
                  <tr className="border-b border-slate-200/10">
                    <td className="py-4 font-bold text-slate-900">Kitchen Pro Elite</td>
                    <td className="py-4 text-slate-500">Appliance</td>
                    <td className="py-4 text-slate-500">120 units</td>
                    <td className="py-4 text-slate-500">12 left</td>
                    <td className="py-4">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-4/5 h-full bg-primary-500 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200/10">
                    <td className="py-4 font-bold text-slate-900">Smart Steamer</td>
                    <td className="py-4 text-slate-500">Eco-Kitchen</td>
                    <td className="py-4 text-slate-500">84 units</td>
                    <td className="py-4 text-slate-500">45 left</td>
                    <td className="py-4">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-blue-500 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 font-bold text-slate-900">Rapid Oven v2</td>
                    <td className="py-4 text-slate-500">Industrial</td>
                    <td className="py-4 text-slate-500">215 units</td>
                    <td className="py-4 text-slate-500">8 left</td>
                    <td className="py-4">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="w-[95%] h-full bg-purple-500 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side Widgets */}
        <div className="col-span-1 lg:col-span-4 space-y-8 overflow-y-auto pr-2 pb-8 custom-scrollbar sticky top-0 h-[calc(100vh-120px)]">
          
          {/* Quick Actions Grid */}
          <div className="bg-gradient-to-br from-primary-500 to-teal-600 text-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to={`${basePath}/products/new`} className="bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95 text-white text-center">
                <PlusCircle className="w-6 h-6" />
                <span className="text-xs font-bold">New Product</span>
              </Link>
              <Link to={`${basePath}/users`} className="bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95 text-white text-center">
                <UserPlus className="w-6 h-6" />
                <span className="text-xs font-bold">Invite User</span>
              </Link>
              <button className="bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95 text-white text-center">
                <BarChart className="w-6 h-6" />
                <span className="text-xs font-bold">Reports</span>
              </button>
              <button className="bg-white/10 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95 text-white text-center">
                <Truck className="w-6 h-6" />
                <span className="text-xs font-bold">Assign Equipment</span>
              </button>
            </div>
          </div>

          {/* Pending Approvals Widget */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl border border-slate-200/60 shadow-md">
            <h3 className="text-2xl font-bold mb-6">Approvals Needed</h3>
            <div className="space-y-4">
              <div className="p-4 border border-slate-200/30 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <FileWarning className="text-blue-700 w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">New Vendor License</p>
                  <p className="text-xs text-slate-500 mb-3">Submitted by Metro Foods Ltd.</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-full hover:opacity-90">Approve</button>
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full hover:bg-slate-100/50">Decline</button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-slate-200/30 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Receipt className="text-purple-800 w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Expense Reimbursement</p>
                  <p className="text-xs text-slate-500 mb-3">Service Team #04 - ₹12,400</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-primary-500 text-white text-xs font-bold rounded-full hover:opacity-90">Approve</button>
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full hover:bg-slate-100/50">Decline</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members (Online Status) */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl border border-slate-200/60 shadow-md">
            <h3 className="text-2xl font-bold mb-6">Operations Team</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img className="w-10 h-10 rounded-full object-cover" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Anita" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Anita Sharma</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Operations Manager</p>
                </div>
                <button className="text-slate-500 hover:text-primary-600"><MessageSquare className="w-5 h-5" /></button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img className="w-10 h-10 rounded-full object-cover" src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Vijay" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Vijay Kumar</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Logistics Lead</p>
                </div>
                <button className="text-slate-500 hover:text-primary-600"><MessageSquare className="w-5 h-5" /></button>
              </div>
              
              <div className="flex items-center gap-3 opacity-60">
                <div className="relative">
                  <img className="w-10 h-10 rounded-full object-cover" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" alt="Priya" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-slate-200 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Priya Menon</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Catalog Admin</p>
                </div>
                <button className="text-slate-500 hover:text-primary-600"><MessageSquare className="w-5 h-5" /></button>
              </div>
            </div>
          </div>

          {/* Calendar Mini Widget */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl border border-slate-200/60 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">April 2024</h3>
              <div className="flex gap-2">
                <button className="hover:bg-slate-100 p-1 rounded"><ChevronLeft className="w-5 h-5 cursor-pointer text-slate-500" /></button>
                <button className="hover:bg-slate-100 p-1 rounded"><ChevronRight className="w-5 h-5 cursor-pointer text-slate-500" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              <span className="text-slate-500 text-[10px] font-bold">S</span>
              <span className="text-slate-500 text-[10px] font-bold">M</span>
              <span className="text-slate-500 text-[10px] font-bold">T</span>
              <span className="text-slate-500 text-[10px] font-bold">W</span>
              <span className="text-slate-500 text-[10px] font-bold">T</span>
              <span className="text-slate-500 text-[10px] font-bold">F</span>
              <span className="text-slate-500 text-[10px] font-bold">S</span>
              
              <span className="py-2 text-slate-500 opacity-30">31</span>
              <span className="py-2">1</span><span className="py-2 font-bold">2</span><span className="py-2">3</span><span className="py-2">4</span><span className="py-2">5</span><span className="py-2">6</span>
              <span className="py-2">7</span><span className="py-2">8</span><span className="py-2">9</span><span className="py-2">10</span><span className="py-2">11</span>
              <span className="py-2 bg-primary-500 text-white rounded-full font-bold">12</span><span className="py-2">13</span>
              <span className="py-2">14</span><span className="py-2">15</span><span className="py-2">16</span><span className="py-2">17</span><span className="py-2">18</span><span className="py-2">19</span><span className="py-2">20</span>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="p-3 bg-blue-100/30 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-xs font-bold text-blue-700">Team Sync</p>
                <p className="text-[10px] text-blue-700/70 font-medium">10:00 AM - 11:30 AM</p>
              </div>
              <div className="p-3 bg-purple-100/30 border-l-4 border-purple-500 rounded-r-lg">
                <p className="text-xs font-bold text-purple-800">Quarterly Review</p>
                <p className="text-[10px] text-purple-800/70 font-medium">2:00 PM - 4:00 PM</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
