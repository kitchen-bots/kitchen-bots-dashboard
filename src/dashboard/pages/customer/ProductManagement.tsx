import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle, ChevronDown, Edit2, Grid, ImageIcon, Info, List, Loader2, Package, Plus, Star, Trash2 } from 'lucide-react';
import { productService } from '../../services/productService';
import { Product } from '../../types';

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const basePath = isAdmin ? '/admin/products' : '/customer/products';

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getProducts();
      setProducts(data?.data || (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  return (
    <div className="p-4 lg:p-10">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Product Management</h2>
          <p className="text-lg text-slate-500">Manage KitchenBots commercial kitchen products and inventory.</p>
        </div>
        <Link 
          to={`${basePath}/new`}
          className="mt-4 md:mt-0 bg-primary-500 text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-primary-600 transition-colors flex items-center gap-2 shadow-sm hover:shadow-sm hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {/* Total Products */}
        <div className="bg-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Products</span>
            <div className="p-2 bg-surface rounded-full">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-slate-900">842</div>
        </div>

        {/* Low Stock */}
        <div className="bg-error-container rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-on-error-container uppercase tracking-wider">Low Stock</span>
            <div className="p-2 bg-white/50 rounded-full">
              <AlertTriangle className="w-5 h-5 text-on-error-container" />
            </div>
          </div>
          <div className="text-4xl font-bold text-on-error-container">12</div>
        </div>

        {/* Active Listings */}
        <div className="bg-primary-500/10 rounded-2xl p-6 shadow-sm border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-primary-600 uppercase tracking-wider">Active Listings</span>
            <div className="p-2 bg-white rounded-full shadow-sm">
              <CheckCircle className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="text-4xl font-bold text-primary-600">790</div>
        </div>

        {/* Best Sellers */}
        <div className="bg-tertiary-fixed rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-on-tertiary-fixed-variant uppercase tracking-wider">Best Sellers</span>
            <div className="p-2 bg-white/50 rounded-full">
              <Star className="w-5 h-5 text-tertiary" />
            </div>
          </div>
          <div className="text-4xl font-bold text-on-tertiary-fixed">15</div>
        </div>
      </div>

      {/* Main Layout: Content + Right Panel */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column (Main Data) */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Filters & Controls */}
          <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[160px]">
                <select className="w-full appearance-none bg-slate-100 hover:bg-slate-100 text-slate-900 text-base px-4 py-2 pr-10 rounded-full border-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors">
                  <option>All Categories</option>
                  <option>Industrial Ovens</option>
                  <option>Prep Stations</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
              </div>
              <div className="relative min-w-[140px]">
                <select className="w-full appearance-none bg-slate-100 hover:bg-slate-100 text-slate-900 text-base px-4 py-2 pr-10 rounded-full border-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors">
                  <option>Stock Status</option>
                  <option>In Stock</option>
                  <option>Low Stock</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
              </div>
            </div>
            
            <div className="flex items-center bg-slate-100 p-1 rounded-full">
              <button className="p-2 bg-white text-primary-600 rounded-full shadow-sm flex items-center justify-center">
                <Grid className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-500 hover:text-primary-600 rounded-full flex items-center justify-center transition-colors">
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-100">
                <Package className="w-12 h-12 mb-4 text-slate-300" />
                <p className="font-medium text-lg">No products found</p>
                <p className="text-sm">Click "Add Product" to get started.</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col border border-slate-100 relative">
                  
                  {/* Action Menu (Hover) */}
                  <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-500 hover:text-rose-600 hover:bg-white shadow-sm transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="aspect-square bg-slate-50 relative flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={product.image}
                      />
                    ) : (
                      <ImageIcon className="text-slate-300 w-16 h-16" />
                    )}
                    <div className={`absolute top-3 left-3 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md ${
                      product.status === 'Active' ? 'bg-white/90 text-primary-700' :
                      product.status === 'Draft' ? 'bg-white/90 text-slate-700' :
                      'bg-white/90 text-rose-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        product.status === 'Active' ? 'bg-primary-500' :
                        product.status === 'Draft' ? 'bg-slate-400' :
                        'bg-rose-500'
                      }`}></span> 
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{product.category}</p>
                        <h3 className="text-2xl font-bold text-slate-900 text-[20px] line-clamp-1">{product.name}</h3>
                      </div>
                    </div>
                    <p className="text-base text-slate-500 mb-4 font-mono text-xs mt-1">SKU: {product.sku}</p>
                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <p className={`text-sm font-medium mb-1 ${(product.stock ?? 0) <= 5 ? 'text-rose-500' : 'text-slate-500'}`}>
                          Stock: {product.stock ?? 0} units {(product.stock ?? 0) <= 5 && '(Low)'}
                        </p>
                        <p className="text-2xl font-bold text-primary-600">₹{(product.price ?? 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          to={`${basePath}/${product.id}`}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors flex items-center justify-center"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (Sidebar Panels) */}
        <div className="w-full xl:w-[340px] flex flex-col gap-6">
          
          {/* Inventory Alerts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 text-[18px]">Inventory Alerts</h3>
              <button className="text-primary-600 text-sm font-medium hover:underline">View All</button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 pb-4 border-b border-surface-variant/50 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base text-slate-900 font-medium">FrostGuard 500</p>
                  <p className="text-sm font-medium text-slate-500">Only 4 units left in main warehouse.</p>
                  <button className="mt-2 text-primary-600 text-sm font-medium font-medium hover:text-primary-600-container transition-colors">Reorder Now</button>
                </div>
              </div>
              
              <div className="flex items-start gap-3 pb-4 border-b border-surface-variant/50 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base text-slate-900 font-medium">AutoFryer XL</p>
                  <p className="text-sm font-medium text-slate-500">Reaching reorder point (15 units).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 text-[18px]">Top Products</h3>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  <img 
                    alt="GrillMaster 3000 thumbnail" 
                    className="w-full h-full object-cover" 
                    src="https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-base text-slate-900 font-medium leading-tight">GrillMaster 3000</p>
                  <p className="text-sm font-medium text-slate-500">142 sold this month</p>
                </div>
                <span className="text-sm font-medium font-bold text-primary-600">#1</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <ImageIcon className="text-surface-dim w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-base text-slate-900 font-medium leading-tight">ChefTable Pro</p>
                  <p className="text-sm font-medium text-slate-500">98 sold this month</p>
                </div>
                <span className="text-sm font-medium font-bold text-slate-500">#2</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
