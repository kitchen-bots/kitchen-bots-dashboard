import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Download, File, FileText, Folder, History, Mail, Phone, Receipt, ShieldCheck, XCircle } from 'lucide-react';

export const UserDetails = () => {
  
  return (
    <div className="p-4 lg:p-10">
      {/* Page Header */}
      <div className="mb-8">
        <Link to="/dashboard/staff" className="text-slate-500 hover:text-primary-600 flex items-center gap-2 mb-4 w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Staff</span>
        </Link>
        <h1 className="text-2xl font-bold font-semibold text-slate-900">User Details</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column (Main Details) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Hero Card */}
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <img 
                alt="Priya Kapoor" 
                className="w-32 h-32 rounded-full object-cover shadow-[0_8px_32px_rgba(0,0,0,0.08)] border-4 border-surface" 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop" 
              />
              <div className="flex-1">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">Priya Kapoor</h2>
                    <p className="text-lg text-primary-600 mt-1">Procurement Manager at Spice Roots Ltd.</p>
                  </div>
                  <span className="bg-[#e6f4ea] text-[#137333] px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#137333]"></span>
                    Active
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 mt-4 text-slate-500 text-base">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    priya.k@spiceroots.in
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    +91 98765 43210
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-slate-200">
              <button className="bg-primary-500 text-white text-sm font-bold py-2.5 px-6 rounded-full hover:bg-primary-500-container transition-colors duration-200">
                Message User
              </button>
              <button className="bg-slate-100 text-slate-900 text-sm font-bold py-2.5 px-6 rounded-full hover:bg-surface-variant transition-colors duration-200">
                Edit User
              </button>
              <div className="flex-1"></div>
              <button className="text-error hover:bg-error-container hover:text-on-error-container text-sm font-bold py-2.5 px-6 rounded-full transition-colors duration-200">
                Suspend
              </button>
              <button className="text-error hover:bg-error-container hover:text-on-error-container text-sm font-bold py-2.5 px-6 rounded-full transition-colors duration-200">
                Delete
              </button>
            </div>
          </section>

          {/* Bento Grid row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details */}
            <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building2 className="text-primary-600 w-6 h-6" />
                Business Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Registered Address</p>
                  <p className="text-base text-slate-900">45 Culinary Heights, Koramangala<br/>Bengaluru, Karnataka 560034</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Tax ID / GSTIN</p>
                  <p className="text-base text-slate-900">29ABCDE1234F1Z5</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Joined Date</p>
                  <p className="text-base text-slate-900">October 12, 2022</p>
                </div>
              </div>
            </section>

            {/* Permissions */}
            <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="text-primary-600 w-6 h-6" />
                Active Permissions
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary-600 w-6 h-6 fill-primary-container" />
                  <span className="text-base text-slate-900">Place Orders</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary-600 w-6 h-6 fill-primary-container" />
                  <span className="text-base text-slate-900">Manage Inventory</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary-600 w-6 h-6 fill-primary-container" />
                  <span className="text-base text-slate-900">Billing & Invoices</span>
                </li>
                <li className="flex items-center gap-3 opacity-50">
                  <XCircle className="text-slate-400 w-6 h-6" />
                  <span className="text-base text-slate-900">System Configuration</span>
                </li>
              </ul>
            </section>
          </div>

          {/* Recent Orders */}
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="text-primary-600 w-6 h-6" />
                Recent Orders
              </h3>
              <button className="text-primary-600 hover:text-primary-600-container text-sm font-medium flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-sm font-medium">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-base text-slate-900">
                  <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-4">#ORD-8902</td>
                    <td className="py-4 text-slate-500">Today, 10:42 AM</td>
                    <td className="py-4 font-medium">₹ 42,500</td>
                    <td className="py-4">
                      <span className="bg-[#fff3e0] text-[#e65100] px-3 py-1 rounded-full text-sm font-medium">Processing</span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-4">#ORD-8875</td>
                    <td className="py-4 text-slate-500">Oct 24, 2023</td>
                    <td className="py-4 font-medium">₹ 18,200</td>
                    <td className="py-4">
                      <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full text-sm font-medium">Delivered</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors duration-150">
                    <td className="py-4">#ORD-8850</td>
                    <td className="py-4 text-slate-500">Oct 18, 2023</td>
                    <td className="py-4 font-medium">₹ 65,000</td>
                    <td className="py-4">
                      <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full text-sm font-medium">Delivered</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar/Meta) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Admin Notes */}
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="text-primary-600 w-6 h-6" />
              Admin Notes
            </h3>
            <textarea 
              className="w-full bg-slate-50 border-0 rounded-xl p-4 text-base text-slate-900 focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-200 resize-none h-32 mb-4 placeholder:text-slate-500/50" 
              placeholder="Add internal notes about this user..."
            ></textarea>
            <button className="w-full bg-slate-100 text-slate-900 text-sm font-bold py-2.5 rounded-full hover:bg-surface-variant transition-colors duration-200">
              Save Note
            </button>
          </section>

          {/* Documents */}
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Folder className="text-primary-600 w-6 h-6" />
              Documents
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors duration-200 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-error-container text-error flex items-center justify-center">
                    <File className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Service_Contract_2023.pdf</p>
                    <p className="text-xs text-slate-500">2.4 MB • Oct 12, 2022</p>
                  </div>
                </div>
                <Download className="text-slate-500 group-hover:text-primary-600 transition-colors w-5 h-5" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors duration-200 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-error-container text-error flex items-center justify-center">
                    <File className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">FSSAI_License.pdf</p>
                    <p className="text-xs text-slate-500">1.1 MB • Oct 15, 2022</p>
                  </div>
                </div>
                <Download className="text-slate-500 group-hover:text-primary-600 transition-colors w-5 h-5" />
              </div>
            </div>
          </section>

          {/* Activity Feed */}
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <History className="text-primary-600 w-6 h-6" />
              Activity Feed
            </h3>
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-variant">
              
              <div className="relative">
                <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-primary-500 border-2 border-surface-container-lowest ring-2 ring-primary-container"></span>
                <p className="text-sm font-medium text-slate-900">Placed Order #ORD-8902</p>
                <p className="text-sm text-slate-500 mt-1">Today, 10:42 AM</p>
              </div>
              
              <div className="relative">
                <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-surface-variant border-2 border-surface-container-lowest"></span>
                <p className="text-sm font-medium text-slate-900">Updated Profile Details</p>
                <p className="text-sm text-slate-500 mt-1">Yesterday, 4:15 PM</p>
              </div>
              
              <div className="relative">
                <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-surface-variant border-2 border-surface-container-lowest"></span>
                <p className="text-sm font-medium text-slate-900">Logged In</p>
                <p className="text-sm text-slate-500 mt-1">Yesterday, 9:00 AM</p>
              </div>
              
              <div className="relative">
                <span className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-surface-variant border-2 border-surface-container-lowest"></span>
                <p className="text-sm font-medium text-slate-900">Placed Order #ORD-8875</p>
                <p className="text-sm text-slate-500 mt-1">Oct 24, 2023, 11:20 AM</p>
              </div>
              
            </div>
            
            <button className="w-full text-center mt-6 text-primary-600 hover:text-primary-600-container text-sm font-medium transition-colors duration-200">
              Load More Activity
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
