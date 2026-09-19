import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Banknote, Eye, File, FileText, Globe, ImageIcon, Info, Loader2, Plus, Settings2, Trash2, Upload, X, Sparkles, FileEdit, UploadCloud, Camera } from 'lucide-react';
import { productService } from '../../services/productService';
import { ProductStatus } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AddProduct = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Deep Fryers',
    description: '',
    price: '',
    stock: '',
    status: 'Active' as ProductStatus,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (status: ProductStatus) => {
    try {
      setIsSubmitting(true);
      await productService.createProduct({
        name: formData.name || 'Untitled Product',
        sku: formData.sku || 'N/A',
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        status: status,
        image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&q=80',
        specs: [],
        isFeatured: false,
        lifecycleState: status === 'Active' ? 'Published' : 'Draft',
        warrantyPeriodMonths: 12,
        amcEligibility: false,
        installationRequired: false,
        compatibleAccessories: [],
        spareParts: [],
        crossSellProducts: [],
        upSellProducts: [],
        relatedProducts: [],
      });
      showToast('Success', 'Product created successfully', 'success');
      // Redirect back to the correct products list
      navigate(isAdmin ? '/admin/products' : '/customer/products');
    } catch (error) {
      console.error("Failed to create product:", error);
      showToast('Error', 'Failed to create product. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 xl:p-10 relative z-10">

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <button onClick={() => navigate(isAdmin ? '/admin/products' : '/customer/products')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4 bg-white/50 px-3 py-1.5 rounded-full border border-slate-200/50 backdrop-blur-md w-fit shadow-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </button>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-primary-700 bg-clip-text text-transparent flex items-center gap-3">
              Create New Product
              <Sparkles className="w-6 h-6 text-primary-500" />
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Design and publish a new item to your catalog.</p>
          </div>

          {/* Product Actions Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50">
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button 
              onClick={() => handleSubmit('Draft')}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileEdit className="w-4 h-4" />}
              Save Draft
            </button>
            <button 
              onClick={() => handleSubmit('Active')}
              disabled={isSubmitting}
              className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 via-primary-500 to-primary-600 text-white font-medium shadow-md shadow-primary-500/20 hover:shadow-[0_8px_25px_rgb(16,185,129,0.4)] hover:-translate-y-0.5 transition-all overflow-hidden group disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <Upload className="w-4 h-4 relative z-10" />}
              <span className="relative z-10">Publish Product</span>
            </button>
          </div>
        </div>

        {/* Bento Grid Layout for Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Primary Details */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Section 1: Product Info */}
            <section className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                    placeholder="e.g. Smart Induction Wok 5000" 
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">SKU Identifier</label>
                  <input 
                    type="text" 
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                    placeholder="KB-IND-5000-W" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                  >
                    <option>Deep Fryers</option>
                    <option>Rocket Stoves</option>
                    <option>BBQ Grills</option>
                    <option>Food Preparation Equipment</option>
                    <option>Commercial Kitchen Solutions</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400 resize-none" 
                    placeholder="Describe the product's unique features and kitchen utility..." 
                    rows={4}
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Section 2: Product Images */}
            <section className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Visual Assets</h3>
                </div>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Up to 8 high-res images</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Dropzone */}
                <div className="col-span-2 aspect-video md:aspect-auto bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-primary-400 hover:bg-primary-50/30 transition-all group p-6 text-center">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:text-primary-500 transition-transform">
                    <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-500">SVG, PNG, JPG or WEBP (max. 800x400px)</p>
                </div>
                
                {/* Image Preview */}
                <div className="col-span-1 aspect-square bg-slate-100 rounded-2xl overflow-hidden relative group border border-slate-200">
                  <img 
                    src="https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&q=80" 
                    alt="Product Preview" 
                    className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white/20 hover:bg-red-500 text-white rounded-full p-2 backdrop-blur-md transition-colors shadow-sm">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Add Placeholder */}
                <div className="col-span-1 aspect-square bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-colors">
                  <Camera className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs font-medium text-slate-500">Add Image</span>
                </div>
              </div>
            </section>

            {/* Section 3: Specifications */}
            <section className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                  <Settings2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Technical Specifications</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Fuel/Power Type</label>
                  <select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer">
                    <option>Electric (Induction)</option>
                    <option>Electric (Coil)</option>
                    <option>Gas (Natural)</option>
                    <option>Gas (LPG)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dimensions (W x D x H)</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                    placeholder="e.g. 600 x 450 x 300 mm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                    placeholder="12.5" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Warranty Period</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                    placeholder="e.g. 24 Months Comprehensive" 
                  />
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Secondary Details */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Section 4: Pricing & Inventory */}
            <section className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                  <Banknote className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Pricing & Stock</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Unit Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-lg">₹</span>
                    <input 
                      type="number" 
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3.5 pl-8 pr-4 text-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-300" 
                      placeholder="45000" 
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Stock Quantity</label>
                    <input 
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                      placeholder="50" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Low Alert</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                      placeholder="5" 
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Documents */}
            <section className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Documentation</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 group hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <File className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">User_Manual.pdf</span>
                  </div>
                  <button className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-white rounded-md shadow-sm opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <button className="w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Upload Document
                </button>
              </div>
            </section>

            {/* Section 6: Visibility & SEO */}
            <section className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Visibility & SEO</h3>
              </div>
              <div className="space-y-6">
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Active on Storefront</p>
                    <p className="text-xs text-slate-500 mt-0.5">Publish immediately to website</p>
                  </div>
                  
                  {/* Custom Toggle Switch */}
                  <button 
                    onClick={() => setIsPublished(!isPublished)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${isPublished ? 'bg-primary-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Meta Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                      Induction 
                      <X className="w-3 h-3 cursor-pointer hover:text-primary-900 transition-colors" />
                    </span>
                    <span className="bg-primary-50 text-primary-700 border border-primary-100 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                      Commercial 
                      <X className="w-3 h-3 cursor-pointer hover:text-primary-900 transition-colors" />
                    </span>
                  </div>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                    placeholder="Add tag and press Enter..." 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Meta Description</label>
                  <textarea 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400 resize-none" 
                    placeholder="SEO optimized description for search results..." 
                    rows={3}
                  ></textarea>
                </div>
                
              </div>
            </section>

          </div>
        </div>
        
      </div>
    </div>
  );
};


export default AddProduct;
