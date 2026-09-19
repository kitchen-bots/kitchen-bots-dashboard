import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Globe, ImageIcon, Info, Loader2, Plus, Settings, History, Trash2, Upload, ChevronRight, PlusCircle, ShieldCheck, CreditCard, Activity, Archive } from 'lucide-react';
import { productService } from '../../services/productService';
import { Product, ProductStatus } from '../../types';
import { useToast } from '../../context/ToastContext';

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: 'The GrillMaster 3000 is a professional-grade commercial kitchen grill designed for high-volume operations.',
    price: '',
    stock: '',
    status: 'Active' as ProductStatus,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const data = await productService.getProductById(id);
        if (data) {
          setProduct(data);
          setFormData({
            name: data.name,
            sku: data.sku || '',
            category: data.category || '',
            description: 'The GrillMaster 3000 is a professional-grade commercial kitchen grill designed for high-volume operations.',
            price: (data.price ?? 0).toString(),
            stock: (data.stock ?? 0).toString(),
            status: data.status as ProductStatus,
          });
        }
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const { showToast } = useToast();

  const handleSubmit = async (status: ProductStatus) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      await productService.updateProduct(id, {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        status: status,
      });
      showToast('Success', 'Product updated successfully', 'success');
      // Redirect back
      navigate(isAdmin ? '/admin/products' : '/customer/products');
    } catch (error) {
      console.error("Failed to update product:", error);
      showToast('Error', 'Failed to update product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 lg:ml-[320px] pt-24 pb-10 px-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 lg:ml-[320px] pt-24 pb-10 px-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <button onClick={() => navigate(isAdmin ? '/admin/products' : '/customer/products')} className="text-primary-600 hover:underline">
          Return to Products
        </button>
      </div>
    );
  }

  
  return (
    <div className="flex-1 lg:ml-[320px] pt-24 pb-10 px-6 lg:px-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <nav className="flex items-center gap-2 text-slate-500 mb-2">
            <Link to={isAdmin ? "/admin/products" : "/customer/products"} className="hover:text-primary-600 transition-colors">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={isAdmin ? "/admin/products" : "/customer/products"} className="hover:text-primary-600 transition-colors">Inventory</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="font-bold text-primary-600">{formData.name}</span>
          </nav>
          
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">Edit Product: {formData.name}</h1>
            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold">
              v2.4.0
            </span>
          </div>
          
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <History className="w-4 h-4" />
            Recently Updated (2h ago)
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <button className="px-6 py-3 border border-slate-200 text-slate-900 rounded-full font-semibold text-sm hover:bg-slate-100 transition-colors">
            Preview Changes
          </button>
          <button 
            onClick={() => navigate(isAdmin ? '/admin/products' : '/customer/products')}
            className="px-6 py-3 border border-rose-500 text-rose-600 rounded-full font-semibold text-sm hover:bg-rose-100 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={() => handleSubmit(formData.status)}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary-500 text-white rounded-full font-semibold text-sm shadow-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Main Forms */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* Product Information */}
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Product Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Product Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="rounded-full border border-slate-200 px-5 py-3 w-full focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">SKU</label>
                <input 
                  type="text" 
                  name="sku"
                  value={formData.sku}
                  readOnly
                  className="rounded-full border border-slate-200 px-5 py-3 w-full bg-slate-50 focus:outline-none text-slate-500" 
                />
              </div>
              
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="rounded-full border border-slate-200 px-5 py-3 w-full focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none bg-white"
                >
                  <option>Deep Fryers</option>
                  <option>Rocket Stoves</option>
                  <option>BBQ Grills</option>
                  <option>Food Preparation Equipment</option>
                  <option>Commercial Kitchen Solutions</option>
                </select>
              </div>
              
              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Description</label>
                <textarea 
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="rounded-[20px] border border-slate-200 px-5 py-3 w-full focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" 
                ></textarea>
              </div>
            </div>
          </section>

          {/* Technical Specifications */}
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Fuel Type</label>
                <input 
                  type="text" 
                  defaultValue="Electric / Gas Hybrid"
                  className="rounded-full border border-slate-200 px-5 py-3 w-full focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Dimensions (W x H x D)</label>
                <input 
                  type="text" 
                  defaultValue="120cm x 90cm x 75cm"
                  className="rounded-full border border-slate-200 px-5 py-3 w-full focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Weight</label>
                <input 
                  type="text" 
                  defaultValue="85 kg"
                  className="rounded-full border border-slate-200 px-5 py-3 w-full focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Power Rating</label>
                <input 
                  type="text" 
                  defaultValue="5.5 kW"
                  className="rounded-full border border-slate-200 px-5 py-3 w-full focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" 
                />
              </div>
            </div>
          </section>

          {/* Visual Assets */}
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-bold text-slate-900">Visual Assets</h3>
              </div>
              <button className="flex items-center gap-2 text-primary-600 font-semibold hover:bg-primary-100 px-4 py-2 rounded-full transition-colors">
                <PlusCircle className="w-5 h-5" />
                Add New
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Image Slots */}
              <div className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <img 
                  src="https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&q=80&w=400&h=400" 
                  alt="GrillMaster 3000" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                  <button className="p-2 bg-white rounded-full text-rose-600 shadow-md hover:scale-110 transition-transform">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-xs font-bold">Upload</span>
              </div>
              
              <div className="aspect-square rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                <Plus className="w-8 h-8" />
              </div>
              
              <div className="aspect-square rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                <Plus className="w-8 h-8" />
              </div>
            </div>
          </section>

          {/* Documentation */}
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Documentation</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 transition-colors hover:border-primary-500/50 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md text-purple-700">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">User_Manual_v2.pdf</p>
                    <p className="text-xs text-slate-500">Updated: Oct 12, 2023</p>
                  </div>
                </div>
                <button className="text-primary-600 font-bold hover:underline">Update</button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 transition-colors hover:border-primary-500/50 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md text-purple-700">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Compliance_Cert_IN.pdf</p>
                    <p className="text-xs text-slate-500">Updated: Sep 05, 2023</p>
                  </div>
                </div>
                <button className="text-primary-600 font-bold hover:underline">Update</button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Contextual Widgets */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          
          {/* Pricing & Stock */}
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Pricing & Stock</h3>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Unit Price (INR)</label>
                <input 
                  type="text" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="rounded-full border border-slate-200 px-5 py-3 w-full focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-xl font-bold text-primary-600" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500">Current Stock</label>
                  <div className="bg-blue-100 p-0 rounded-2xl text-center overflow-hidden flex items-center justify-center border border-blue-200">
                    <input 
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full bg-transparent text-center text-2xl font-bold text-blue-700 focus:outline-none p-4"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500">Alert Threshold</label>
                  <div className="bg-slate-100 p-4 rounded-2xl text-center">
                    <span className="text-2xl font-bold text-slate-900">10</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Change History Panel */}
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Change History</h3>
            </div>
            
            <div className="relative pl-6 flex flex-col gap-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200/50">
              <div className="relative">
                <span className="absolute -left-[29px] top-1 w-[14px] h-[14px] rounded-full bg-primary-500 ring-[3px] ring-white"></span>
                <p className="font-bold text-slate-900">Price updated by Raj</p>
                <p className="text-xs text-slate-500">3 hours ago • IP: 192.168.1.1</p>
              </div>
              
              <div className="relative">
                <span className="absolute -left-[29px] top-1 w-[14px] h-[14px] rounded-full bg-slate-200 ring-[3px] ring-white"></span>
                <p className="font-bold text-slate-900">Description edited by Priya</p>
                <p className="text-xs text-slate-500">Yesterday, 4:45 PM</p>
              </div>
              
              <div className="relative">
                <span className="absolute -left-[29px] top-1 w-[14px] h-[14px] rounded-full bg-slate-200 ring-[3px] ring-white"></span>
                <p className="font-bold text-slate-900">New image added</p>
                <p className="text-xs text-slate-500">Oct 24, 2023</p>
              </div>
            </div>
          </section>

          {/* Version Control Widget */}
          <section className="bg-primary-100 text-primary-700 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-4">
              <Archive className="w-6 h-6" />
              <h3 className="text-lg font-bold text-primary-700">Version Control</h3>
            </div>
            
            <p className="text-sm mb-4 opacity-90">
              Restore previous configurations or view historical snapshots.
            </p>
            
            <select className="w-full bg-white/20 border-transparent text-white rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none font-bold mb-4">
              <option className="text-slate-900">v2.4.0 (Current)</option>
              <option className="text-slate-900">v2.3.0 (Legacy)</option>
              <option className="text-slate-900">v2.2.0 (Audit)</option>
            </select>
            
            <button className="w-full bg-white text-primary-600 rounded-full py-3 font-bold hover:bg-slate-50 transition-colors">
              Compare Versions
            </button>
          </section>

          {/* Visibility & SEO */}
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-primary-600" />
              <h3 className="text-lg font-bold text-slate-900">Visibility & SEO</h3>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Active on Storefront</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.status === 'Active'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'Active' : 'Draft' }))}
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              
              <hr className="border-slate-200/50" />
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500">Meta Title</label>
                <input 
                  type="text" 
                  defaultValue="GrillMaster 3000 - Professional Commercial Grill"
                  className="rounded-full border border-slate-200 px-5 py-3 w-full focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" 
                />
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                <p className="text-[14px] text-blue-700 font-medium mb-1 truncate">
                  GrillMaster 3000 - Professional Commercial Grill
                </p>
                <p className="text-[12px] text-primary-600 mb-1 truncate">
                  https://kitchenbots.in/products/grillmaster-3000
                </p>
                <p className="text-[12px] text-slate-500 line-clamp-2">
                  Discover the ultimate in kitchen efficiency with the GrillMaster 3000. Optimized for high-volume Indian catering...
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
