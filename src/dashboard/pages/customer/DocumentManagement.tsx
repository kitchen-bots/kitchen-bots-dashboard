import { Book, ChevronLeft, ChevronRight, Download, ExternalLink, Eye, FileText, FolderOpen, Maximize, Microwave, Plus, Receipt, Refrigerator, Share2, ShieldCheck, Upload, Wrench } from 'lucide-react';

export const DocumentManagement = () => {
  return (
    <div className="p-4 lg:p-10 pb-24">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Documents</h1>
          <p className="text-lg text-slate-500">Centralized repository for all kitchen equipment assets.</p>
        </div>
        <button className="bg-primary-500 text-white px-8 py-4 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:bg-primary-600 transition-all active:scale-95 w-full md:w-auto">
          <Upload className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="h-12 w-12 rounded-full bg-primary-500/10 text-primary-600 flex items-center justify-center mb-2">
            <FolderOpen className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-slate-500">Total Documents</span>
          <span className="text-3xl font-bold text-slate-900">2,450</span>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="h-12 w-12 rounded-full bg-blue-100/30 text-blue-600 flex items-center justify-center mb-2">
            <Receipt className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-slate-500">Invoices</span>
          <span className="text-3xl font-bold text-slate-900">1,120</span>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="h-12 w-12 rounded-full bg-orange-100/30 text-orange-600 flex items-center justify-center mb-2">
            <Book className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-slate-500">Manuals</span>
          <span className="text-3xl font-bold text-slate-900">840</span>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 flex flex-col gap-2">
          <div className="h-12 w-12 rounded-full bg-red-100/30 text-red-600 flex items-center justify-center mb-2">
            <Wrench className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-slate-500">Service Reports</span>
          <span className="text-3xl font-bold text-slate-900">490</span>
        </div>
      </section>

      {/* Filters and Table Container */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Left Filter Panel */}
        <aside className="w-full xl:w-64 flex flex-col gap-6 bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-fit">
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Document Type</h4>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-600/20" />
                <span className=" text-slate-900 group-hover:text-primary-600 transition-colors">Invoice</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-600/20" />
                <span className=" text-slate-900 group-hover:text-primary-600 transition-colors">Manual</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-600/20" />
                <span className=" text-slate-900 group-hover:text-primary-600 transition-colors">Certification</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded-md border-slate-300 text-primary-600 focus:ring-primary-600/20" />
                <span className=" text-slate-900 group-hover:text-primary-600 transition-colors">Service Report</span>
              </label>
            </div>
          </div>
          
          <div className="h-px bg-slate-200 w-full"></div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Product Category</h4>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-primary-600/20 text-slate-900">
              <option>All Equipment</option>
              <option>Refrigeration</option>
              <option>Cooking Ranges</option>
              <option>Dishwashers</option>
            </select>
          </div>
          
          <div className="h-px bg-slate-200 w-full"></div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Upload Date</h4>
            <div className="space-y-2">
              <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-primary-600/20 text-slate-900" />
              <p className="text-center text-slate-500 font-medium">to</p>
              <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-primary-600/20 text-slate-900" />
            </div>
          </div>
          
          <button className="w-full text-primary-600 font-bold py-3 hover:bg-primary-50 rounded-full transition-colors mt-2">
            Reset All Filters
          </button>
        </aside>

        {/* Document Table Section */}
        <section className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-6 font-bold text-slate-500">File Name</th>
                  <th className="p-4 font-bold text-slate-500">Type</th>
                  <th className="p-4 font-bold text-slate-500">Related Product</th>
                  <th className="p-4 font-bold text-slate-500">Date</th>
                  <th className="p-4 font-bold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                
                {/* Row 1 */}
                <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">Maintenance_Guide_V2.pdf</p>
                        <p className="font-medium text-slate-500">4.2 MB</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-100/30 text-secondary px-3 py-1 rounded-full text-[12px] font-bold">MANUAL</span>
                  </td>
                  <td className="p-4">
                    <span className=" text-slate-900">GrillMaster 3000 PRO</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-slate-500">Oct 24, 2023</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-primary-600">
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-primary-600">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="bg-slate-50/20 hover:bg-slate-50/50 transition-colors group cursor-pointer border-l-4 border-primary">
                  <td className="p-6 pl-[20px]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">Installation_Invoice_7721.pdf</p>
                        <p className="font-medium text-slate-500">1.8 MB</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-primary-500/10 text-primary-600 px-3 py-1 rounded-full text-[12px] font-bold">INVOICE</span>
                  </td>
                  <td className="p-4">
                    <span className=" text-slate-900">CoolFreeze Industrial</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-slate-500">Oct 22, 2023</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-primary-600">
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-primary-600">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">ISO_9001_Certification.pdf</p>
                        <p className="font-medium text-slate-500">2.1 MB</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-tertiary-fixed-dim/40 text-on-tertiary-fixed px-3 py-1 rounded-full text-[12px] font-bold">CERT</span>
                  </td>
                  <td className="p-4">
                    <span className=" text-slate-900">Global Series Ranges</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-slate-500">Oct 15, 2023</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-primary-600">
                        <Download className="w-5 h-5" />
                      </button>
                      <button className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500 hover:text-primary-600">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-medium text-slate-500">Showing 1-10 of 2,450 results</p>
            <div className="flex gap-2">
              <button className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-900">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="h-10 w-10 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-md font-bold">1</button>
              <button className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-900 font-bold">2</button>
              <button className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-900 font-bold">3</button>
              <button className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-900">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Right Preview Panel (Visible on Desktop/XL) */}
        <aside className="hidden 2xl:flex w-[340px] flex-col gap-6 bg-white p-6 rounded-lg shadow-lg border border-slate-200/30">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-900">Document Preview</h3>
              <button className="text-slate-500 hover:text-primary-600 transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
            
            <div className="aspect-[3/4] rounded-lg bg-slate-100 mb-6 relative overflow-hidden border border-slate-200 group">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <img 
                  alt="Document Preview" 
                  className="w-full h-full object-cover opacity-80" 
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=400"
                />
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-all opacity-0 group-hover:opacity-100">
                  <div className="bg-surface/90 p-4 rounded-full shadow-lg scale-90 group-hover:scale-110 transition-transform">
                    <Eye className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Metadata</h4>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-200/30">
                <span className="font-medium text-slate-500">Size</span>
                <span className="font-medium text-slate-900 font-bold">1.8 MB</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/30">
                <span className="font-medium text-slate-500">Version</span>
                <span className="font-medium text-slate-900 font-bold">v1.2 (Latest)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/30">
                <span className="font-medium text-slate-500">Owner</span>
                <span className="font-medium text-slate-900 font-bold">Rahul Sharma</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200/30">
                <span className="font-medium text-slate-500">Permissions</span>
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full border-2 border-surface-container-lowest bg-blue-500 flex items-center justify-center text-white text-[10px]">RS</div>
                  <div className="h-6 w-6 rounded-full border-2 border-surface-container-lowest bg-green-500 flex items-center justify-center text-white text-[10px]">AK</div>
                  <div className="h-6 w-6 rounded-full bg-slate-100 border-2 border-surface-container-lowest flex items-center justify-center text-[10px] text-slate-900 font-bold">+3</div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-3 mt-4">Related Products</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/20 hover:border-primary/30 transition-all cursor-pointer">
                <div className="h-10 w-10 rounded bg-white flex items-center justify-center shrink-0">
                  <Refrigerator className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 font-bold">CoolFreeze Industrial</p>
                  <p className="text-[12px] text-slate-500">Ref No: CF-2023-A9</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200/20 hover:border-primary/30 transition-all cursor-pointer">
                <div className="h-10 w-10 rounded bg-white flex items-center justify-center shrink-0">
                  <Microwave className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 font-bold">SteamPro Oven 5</p>
                  <p className="text-[12px] text-slate-500">Ref No: SP-2024-X1</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-6">
            <button className="w-full bg-primary-500 text-white py-4 rounded-full font-bold shadow-md flex items-center justify-center gap-2 hover:bg-primary-500-container transition-all">
              <ExternalLink className="w-5 h-5" />
              <span>View Full Doc</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Contextual FAB (Only for Document Management) */}
      <button className="fixed bottom-10 right-10 h-16 w-16 bg-blue-100 text-blue-700 rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all">
        <Plus className="w-8 h-8" strokeWidth={3} />
      </button>
    </div>
  );
};

export default DocumentManagement;
