import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Edit2,
  Home,
  ImageIcon,
  Loader2,
  Package,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith('/admin');
  const basePath = isAdmin ? '/admin/products' : '/dashboard/products';
  const homePath = isAdmin ? '/admin' : '/dashboard';

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getProducts();
        if (isMounted) {
          setProducts(data?.data || (Array.isArray(data) ? data : []));
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        if (isMounted) {
          showToast('Error', 'Failed to load product catalog.', 'error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this equipment item?')) return;
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Success', 'Product removed successfully.', 'success');
    } catch (error) {
      console.error('Failed to delete product:', error);
      showToast('Error', 'Failed to delete product.', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesStock =
      stockFilter === 'All' ||
      (stockFilter === 'Low' && (p.stock ?? 0) <= 5) ||
      (stockFilter === 'InStock' && (p.stock ?? 0) > 5);
    return matchesCategory && matchesStock;
  });

  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= 5).length;
  const activeCount = products.filter((p) => p.status === 'Active').length;

  return (
    <PageContainer
      title="Commercial Equipment Catalog"
      description="Manage automated kitchen hardware, pricing tiers, and warehouse inventory levels."
      homeHref={homePath}
      breadcrumbs={[
        { label: isAdmin ? 'Admin' : 'Dashboard', href: homePath },
        { label: 'Products' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(homePath)}
            className="gap-1.5"
            title="Return to Home Dashboard"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`${basePath}/new`)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Equipment</span>
          </Button>
        </div>
      }
    >
      {/* Top Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Hardware
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{products.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Cataloged machinery units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-rose-500">{lowStockCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">5 or fewer units in hub</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Listings
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-emerald-500">{activeCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Available for order fulfillment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Best Sellers
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-amber-500">
              <Star className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">15</div>
            <p className="text-[11px] text-muted-foreground mt-1">High-demand commercial units</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column (Main Catalog) */}
        <div className="lg:col-span-3 min-w-0 space-y-6">
          {/* Filters Bar */}
          <Card className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Filter by Category"
                    className="appearance-none bg-background border border-input rounded-md pl-3 pr-8 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Commercial Ranges">Commercial Ranges</option>
                    <option value="Refrigeration Units">Refrigeration Units</option>
                    <option value="Steam Cooking & Ovens">Steam Cooking & Ovens</option>
                    <option value="Deep Fryers">Deep Fryers</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    aria-label="Filter by Stock Level"
                    className="appearance-none bg-background border border-input rounded-md pl-3 pr-8 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="InStock">In Stock (&gt; 5 units)</option>
                    <option value="Low">Low Stock (≤ 5 units)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Showing {filteredProducts.length} items
              </span>
            </div>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
                <Package className="w-10 h-10 mb-2 opacity-50" />
                <p className="font-semibold text-sm text-foreground">No equipment found</p>
                <p className="text-xs text-muted-foreground mt-1">Adjust filters or register new products.</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group flex flex-col">
                  <div className="aspect-video bg-muted/30 relative flex items-center justify-center overflow-hidden border-b border-border">
                    {product.image ? (
                      <img
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        src={product.image}
                      />
                    ) : (
                      <ImageIcon className="text-muted-foreground w-10 h-10 opacity-40" />
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <Badge
                        variant={product.status === 'Active' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {product.status}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4 flex flex-col flex-1">
                    <p className="text-[11px] text-muted-foreground">{product.category}</p>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1 mt-0.5">
                      {product.name}
                    </h3>
                    <p className="font-mono text-[11px] text-muted-foreground mt-1">
                      SKU: {product.sku}
                    </p>

                    <div className="mt-auto pt-3 border-t border-border flex items-end justify-between">
                      <div>
                        <p
                          className={`text-[11px] font-medium ${
                            (product.stock ?? 0) <= 5 ? 'text-rose-500' : 'text-muted-foreground'
                          }`}
                        >
                          Stock: {product.stock ?? 0} units
                        </p>
                        <p className="text-base font-bold text-foreground">
                          ₹{(product.price ?? 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Link
                          to={`${basePath}/${product.id}`}
                          className="h-8 w-8 rounded-md border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
                          title="Edit Equipment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="h-8 w-8 rounded-md border border-border bg-muted/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete Equipment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column (Alerts Panel) */}
        <div className="lg:col-span-1 min-w-0 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold">Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-xs">
              <div className="flex items-start gap-2.5 pb-3 border-b border-border">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">CoolFreeze Industrial</p>
                  <p className="text-[11px] text-muted-foreground">Only 2 units remaining in hub</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">SteamPro Oven 5</p>
                  <p className="text-[11px] text-muted-foreground">Reorder threshold reached (4 units)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProductManagement;
