import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Package,
  Plus,
  Save,
} from 'lucide-react';
import { productService } from '../../services/productService';
import { ProductStatus } from '../../types';
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

function generateFallbackSku(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) || 'PROD';
  return `KB-${clean}-01`;
}

export const AddProduct = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Commercial Ranges',
    description: '',
    price: '',
    stock: '',
    status: 'Active' as ProductStatus,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (status: ProductStatus) => {
    if (!formData.name) {
      showToast('Validation Error', 'Please enter a product name.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await productService.createProduct({
        name: formData.name || 'Untitled Product',
        sku: formData.sku || generateFallbackSku(formData.name),
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        status: status,
        image: '/products/commercial-gas-range.svg',
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
      showToast('Success', 'Product catalog entry created.', 'success');
      navigate(productsPath);
    } catch (error) {
      console.error('Failed to create product:', error);
      showToast('Error', 'Failed to create product. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const homePath = isAdmin ? '/admin' : '/dashboard';
  const productsPath = isAdmin ? '/admin/products' : '/dashboard/products';

  return (
    <PageContainer
      title="Create New Product"
      description="Register commercial kitchen equipment, configure pricing, and publish to inventory catalog."
      homeHref={homePath}
      breadcrumbs={[
        { label: isAdmin ? 'Admin' : 'Dashboard', href: homePath },
        { label: 'Products', href: productsPath },
        { label: 'New Product' },
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
            variant="secondary"
            size="sm"
            onClick={() => handleSubmit('Draft')}
            isLoading={isSubmitting}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </Button>
          <Button
            size="sm"
            onClick={() => handleSubmit('Active')}
            isLoading={isSubmitting}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Product</span>
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
                  placeholder="e.g. MasterCook Double-Chamber Induction Range"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    SKU / Serial Identifier
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g. KB-IND-2024"
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Equipment Category
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
                  Commercial Description & Operational Specs
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Detailed equipment description, power requirements (kW, voltage), and commercial throughput capacity..."
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring resize-none transition-colors"
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
                  Unit Price (INR ₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 145000"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Initial Stock Units
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-colors"
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
                  <Plus className="w-4 h-4" />
                  <span>Create Product Record</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default AddProduct;
