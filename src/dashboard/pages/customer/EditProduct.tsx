import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Package,
  Save,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { Product, ProductStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
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
            category: data.category || 'Commercial Ranges',
            description:
              data.description ||
              'Professional-grade commercial kitchen unit built for continuous food service throughput.',
            price: (data.price ?? 0).toString(),
            stock: (data.stock ?? 0).toString(),
            status: (data.status as ProductStatus) || 'Active',
          });
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      navigate(productsPath);
    } catch (error) {
      console.error('Failed to update product:', error);
      showToast('Error', 'Failed to update product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const homePath = isAdmin ? '/admin' : '/dashboard';
  const productsPath = isAdmin ? '/admin/products' : '/dashboard/products';

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[350px] text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Product Not Found</h2>
        <p className="text-sm text-muted-foreground mb-4">
          The requested product ID could not be loaded from the database.
        </p>
        <Button type="button" onClick={() => navigate(productsPath)}>Return to Products</Button>
      </div>
    );
  }

  return (
    <PageContainer
      title={`Edit: ${product.name}`}
      description="Update machinery specifications, pricing matrices, and inventory status."
      homeHref={homePath}
      breadcrumbs={[
        { label: isAdmin ? 'Admin' : 'Dashboard', href: homePath },
        { label: 'Products', href: productsPath },
        { label: 'Edit Product' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
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
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(productsPath)}
            className="gap-1.5"
            title="Return to Products"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit(formData.status)}
            isLoading={isSubmitting}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Product Info Form */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground">
                  <Package className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Equipment Details</CardTitle>
                  <CardDescription className="text-xs">
                    Basic machinery specifications and naming
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    SKU / Identifier
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer transition-colors"
                  >
                    <option>Commercial Ranges</option>
                    <option>Refrigeration Units</option>
                    <option>Steam Cooking & Ovens</option>
                    <option>Dishwashers & Sanitization</option>
                    <option>Deep Fryers</option>
                    <option>Robotic Prep Stations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Description & Specifications
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring resize-none transition-colors"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pricing & Inventory */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold">Pricing & Inventory</CardTitle>
              <CardDescription className="text-xs">Valuation and warehouse availability</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Unit Price (INR ₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Stock Units
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Catalog Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer transition-colors"
                >
                  <option value="Active">Active (Available)</option>
                  <option value="Draft">Draft (Hidden)</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleSubmit(formData.status)}
                  isLoading={isSubmitting}
                  className="w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Product</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default EditProduct;
