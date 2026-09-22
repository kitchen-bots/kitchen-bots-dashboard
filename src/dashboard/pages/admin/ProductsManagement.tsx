import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Edit, LayoutGrid, List, Package, Plus, Search, Star, Trash2 } from 'lucide-react';
import { CommerceProduct } from '../../types/commerce';
import { useProducts, useCategoryStats, useToggleFeatured, useDeleteProduct, useUpdateProduct, useCreateProduct } from '../../hooks/queries';
import { ErrorState } from '../../components/common/ErrorState';
import { ProductModal } from '../../components/Modals/ProductModal';
import { ConfirmDeleteModal, InventoryModal } from '../../components/Modals';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Heading, Text } from '../../components/ui/Typography';
import { Drawer } from '../../components/ui/Drawer';
import { DataGrid } from '../../components/ui/DataGrid';
import { PageContainer } from '../../components/layout/PageContainer';
import { ColumnDef } from '@tanstack/react-table';

export function ProductsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: productsData, isLoading: loadingProducts, error: productsError, refetch } = useProducts({ search: searchQuery });
  const { data: statsData, isLoading: loadingStats } = useCategoryStats();
  
  const toggleFeaturedMutation = useToggleFeatured();
  const deleteProductMutation = useDeleteProduct();
  const updateProductMutation = useUpdateProduct();
  const createProductMutation = useCreateProduct();

  const products = productsData?.data || [];
  const categoryStats = statsData || [];
  
  const loading = loadingProducts || loadingStats;
  const error = productsError ? "Failed to load products. Please check your connection." : null;
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedProduct, setSelectedProduct] = useState<CommerceProduct | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<CommerceProduct | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<CommerceProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleFeatured = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await toggleFeaturedMutation.mutateAsync(id);
      if (selectedProduct?.id === id) {
        setSelectedProduct({ ...selectedProduct, isFeatured: !selectedProduct.isFeatured });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const closePanel = () => setSelectedProduct(null);

  const handleAddProduct = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: CommerceProduct) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: CommerceProduct) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProductMutation.mutateAsync(productToDelete.id);
      if (selectedProduct?.id === productToDelete.id) {
        closePanel();
      }
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (e) {
      console.error("Failed to delete product", e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalSubmit = async (productData: any) => {
    try {
      if (productToEdit) {
        await updateProductMutation.mutateAsync({ id: productToEdit.id, data: productData });
        const updated = await updateProductMutation.mutateAsync({ id: productToEdit.id, data: productData }); // re-fetch ideally, hacky return
        setSelectedProduct(prev => prev?.id === updated.id ? updated : prev);
      } else {
        await createProductMutation.mutateAsync(productData);
      }
    } catch (e) {
      console.error("Failed to save product", e);
      throw e;
    }
  };

  const getStatusVariant = (status: string | undefined) => {
    switch(status) {
      case 'Active': return 'default';
      case 'Draft': return 'warning';
      case 'Archived': return 'secondary';
      case 'Hidden': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPrimaryImage = (product: CommerceProduct) => {
    const primary = product.images?.find(i => i.isPrimary) || product.images?.[0];
    return primary?.url || 'https://via.placeholder.com/150';
  };

  const getPriceRange = (product: CommerceProduct) => {
    if (!product.variants || product.variants.length === 0) return '₹0';
    const prices = product.variants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `₹${min.toLocaleString('en-IN')}`;
    return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
  };

  const ProductThumbnail = ({ src, alt, className = "w-12 h-12 rounded-md object-cover border border-border shrink-0" }: { src: string; alt: string; className?: string }) => {
    const [hasError, setHasError] = React.useState(false);

    if (hasError || !src) {
      return (
        <div className={`bg-muted flex items-center justify-center border border-border text-muted-foreground ${className}`}>
          <Package size={20} />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className={className}
      />
    );
  };

  const columns = React.useMemo<ColumnDef<CommerceProduct>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-3">
              <ProductThumbnail src={getPrimaryImage(product)} alt={product.name} />
              <div className="min-w-0">
                <Text className="font-semibold truncate">{product.name}</Text>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-mono whitespace-nowrap shrink-0">
                    {product.sku}
                  </Badge>
                  <Text variant="muted" className="text-xs whitespace-nowrap shrink-0">{product.variants.length} Variants</Text>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'price',
        header: 'Category & Price',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <>
              <Text>{getPriceRange(product)}</Text>
              <Text variant="muted" className="text-xs">{product.category}</Text>
            </>
          );
        },
      },
      {
        accessorKey: 'isFeatured',
        header: 'Featured',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <button 
              onClick={(e) => handleToggleFeatured(e, product.id)}
              className={`p-1.5 rounded-full transition-colors ${product.isFeatured ? 'text-yellow-400 bg-yellow-50 hover:bg-yellow-100' : 'text-slate-300 hover:text-slate-400 hover:bg-slate-100'}`}
            >
              <Star size={18} fill={product.isFeatured ? "currentColor" : "none"} />
            </button>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex flex-col gap-1 items-start">
              <Badge variant={getStatusVariant(product.status)}>
                {product.status || 'Draft'}
              </Badge>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="text-right flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}>
                <Edit size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}>
                <ChevronRight size={18} />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const COLORS = ['#1a7a3c', '#0f4a24', '#f59e0b', '#e5e7eb'];

  if (loading && !products.length) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <ErrorState message={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <PageContainer
      title="Product Catalog"
      description="Manage enterprise product catalog, variations, and specifications."
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Products' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Top Analytics Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { title: 'Total Products', value: products.length.toString(), icon: Package, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
            { title: 'Active Products', value: products.filter(p => p.status === 'Active').length.toString(), icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
            { title: 'Draft Products', value: products.filter(p => p.status === 'Draft').length.toString(), icon: Edit, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
            { title: 'Categories', value: categoryStats.length.toString(), icon: List, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
          ].map((stat, index) => (
            <Card key={index} className="flex flex-col justify-between">
              <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <div>
                  <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">{stat.title}</Text>
                  <Heading level="h3" className="mt-1">{stat.value}</Heading>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Layout - 4-column aligned grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
          
          {/* Left Column (Toolbar & Table/Grid) - 75% */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 min-w-0 flex flex-col gap-6"
          >
            {/* Toolbar */}
            <Card>
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                      type="text" 
                      placeholder="Search products, SKU..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 justify-between md:justify-end">
                  <div className="flex bg-muted p-1 rounded-lg border border-border">
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <List size={18} />
                    </button>
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-card shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <LayoutGrid size={18} />
                    </button>
                  </div>
                  <Button onClick={handleAddProduct} className="flex items-center gap-2">
                    <Plus size={18} />
                    Add Product
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Products View */}
            <Card className="overflow-hidden">
              {viewMode === 'list' ? (
                <DataGrid 
                  columns={columns} 
                  data={products} 
                  total={products.length}
                  onRowClick={(product) => setSelectedProduct(product)} 
                  isLoading={loadingProducts}
                />
              ) : (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map(product => (
                    <div key={product.id} onClick={() => setSelectedProduct(product)} className="border border-border-default rounded-lg overflow-hidden hover:shadow-elevation-sm transition-shadow cursor-pointer bg-surface flex flex-col">
                      <div className="h-40 relative flex-shrink-0 bg-muted flex items-center justify-center">
                        <ProductThumbnail src={getPrimaryImage(product)} alt={product.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button 
                            onClick={(e) => handleToggleFeatured(e, product.id)}
                            className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${product.isFeatured ? 'text-yellow-400 bg-white/80' : 'text-white bg-black/30 hover:bg-black/50'}`}
                          >
                            <Star size={16} fill={product.isFeatured ? "currentColor" : "none"} />
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 flex gap-2">
                            <Badge variant={getStatusVariant(product.status)} className="backdrop-blur-md bg-white/80 text-[10px]">
                              {product.status}
                            </Badge>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <Heading level="h5" className="line-clamp-1">{product.name}</Heading>
                        <Text variant="muted" className="text-xs mb-3">{product.category} • {product.sku}</Text>
                        
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-default">
                          <Text className="font-bold">{getPriceRange(product)}</Text>
                          <Text variant="muted" className="text-xs">{product.variants.length} Variants</Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Right Column (Widgets) - 25% */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 min-w-0 flex flex-col gap-6"
          >
            {/* Categories Donut Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2.5 mt-4 border-t border-border pt-4">
                  {categoryStats.map((stat, idx) => (
                    <div key={stat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="truncate text-foreground font-medium">{stat.name}</span>
                      </div>
                      <span className="text-muted-foreground font-mono shrink-0 ml-2">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Slide-out Product Detail Drawer */}
        <Drawer
          isOpen={!!selectedProduct}
          onClose={closePanel}
          title="Product Details"
          description={selectedProduct?.sku}
          size="lg"
        >
          {selectedProduct && (
            <div className="space-y-8 pb-8">
              {/* Large Preview */}
              <div className="relative rounded-lg overflow-hidden border border-border-default bg-slate-50 aspect-video">
                <img src={getPrimaryImage(selectedProduct)} alt={selectedProduct.name} className="w-full h-full object-contain mix-blend-multiply" />
                {selectedProduct.isFeatured && (
                  <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Featured
                  </div>
                )}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {selectedProduct.tags.map(tag => (
                      <span key={tag} className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Heading level="h3">{selectedProduct.name}</Heading>
                    <Text variant="muted" className="mt-1">{selectedProduct.category} • {selectedProduct.brand}</Text>
                  </div>
                  <div className="text-right">
                    <Heading level="h3">{getPriceRange(selectedProduct)}</Heading>
                    <div className="mt-1">
                      <Badge variant={getStatusVariant(selectedProduct.status)}>
                        {selectedProduct.status || 'Draft'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-700 mb-6">
                  {selectedProduct.description || selectedProduct.shortDescription || 'No description provided.'}
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-border-default mb-6">
                  <div>
                    <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold">Visibility</Text>
                    <Text className="text-sm font-medium mt-1">{selectedProduct.visibility}</Text>
                  </div>
                  <div>
                    <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold">Total Variants</Text>
                    <Text className="text-sm font-medium mt-1">{selectedProduct.variants?.length || 0}</Text>
                  </div>
                </div>
              </div>

              {/* Variants */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div>
                  <Text className="text-sm font-semibold mb-3 uppercase tracking-wider text-foreground">Variants</Text>
                  <div className="space-y-2">
                    {selectedProduct.variants.map((variant) => (
                      <div key={variant.id} className="flex justify-between items-center p-3 border border-border rounded-md bg-card">
                        <div>
                          <Text className="font-medium text-sm text-foreground">{variant.name || variant.sku}</Text>
                          <Text variant="muted" className="text-xs">{variant.sku}</Text>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <Text className="font-medium text-sm text-foreground">₹{variant.price.toLocaleString('en-IN')}</Text>
                          <Badge variant={variant.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">
                            {variant.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                <div>
                  <Text className="text-sm font-semibold mb-3 uppercase tracking-wider text-foreground">Specifications</Text>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.specifications.map((spec) => (
                      <div key={spec.id} className="flex justify-between p-2 bg-muted/40 border border-border rounded text-sm">
                        <span className="text-muted-foreground">{spec.name}</span>
                        <span className="font-medium text-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-4 border-t border-border">
                <Text className="text-sm font-semibold mb-3 uppercase tracking-wider text-foreground">Actions</Text>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => handleEditProduct(selectedProduct)} className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground transition-colors">
                    <Edit size={18} className="mb-2 text-primary" />
                    <span className="text-xs font-medium">Edit Product</span>
                  </button>
                  <button onClick={() => setIsInventoryModalOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground transition-colors">
                    <Package size={18} className="mb-2 text-emerald-500" />
                    <span className="text-xs font-medium">Inventory</span>
                  </button>
                  <button onClick={() => handleDeleteClick(selectedProduct)} className="flex flex-col items-center justify-center p-3 rounded-lg border border-destructive/20 bg-card hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 size={18} className="mb-2" />
                    <span className="text-xs font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </Drawer>

        {/* Modals */}
        <ProductModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialData={productToEdit}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          itemName={productToDelete?.name || 'this product'}
          isDeleting={isDeleting}
        />

        <InventoryModal
          isOpen={isInventoryModalOpen}
          onClose={() => setIsInventoryModalOpen(false)}
          product={selectedProduct}
        />
      </div>
    </PageContainer>
  );
}

export default ProductsManagement;
