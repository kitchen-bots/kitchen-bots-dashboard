import re

with open('src/dashboard/pages/admin/ProductsManagement.tsx', 'r') as f:
    content = f.read()

# Add React Query imports
import_str = "import { useProducts, useProductActivity, useCategoryStats, useToggleFeatured, useDeleteProduct, useUpdateProduct, useCreateProduct } from '../../hooks/queries';\n"
content = content.replace("import { productService, ProductActivity } from '../../services/productService';", import_str + "import { productService, ProductActivity } from '../../services/productService';")

# Replace states and fetchData
states_to_replace = """  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<ProductActivity[]>([]);
  const [categoryStats, setCategoryStats] = useState<{name: string, value: number}[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);"""

new_states = """  const { data: productsData, isLoading: loadingProducts, error: productsError } = useProducts();
  const { data: activitiesData, isLoading: loadingActivities } = useProductActivity();
  const { data: statsData, isLoading: loadingStats } = useCategoryStats();
  
  const toggleFeaturedMutation = useToggleFeatured();
  const deleteProductMutation = useDeleteProduct();
  const updateProductMutation = useUpdateProduct();
  const createProductMutation = useCreateProduct();

  const products = productsData?.data || [];
  const activities = activitiesData?.data || [];
  const categoryStats = statsData || [];
  
  const loading = loadingProducts || loadingActivities || loadingStats;
  const error = productsError ? "Failed to load products. Please check your connection." : null;"""

content = content.replace(states_to_replace, new_states)

# Remove fetchData and its useEffect
fetch_data_block = """  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, activitiesRes, statsData] = await Promise.all([
        productService.getProducts(),
        productService.getProductActivity(),
        productService.getCategoryStats()
      ]);
      setProducts(productsRes.data);
      setActivities(activitiesRes.data);
      setCategoryStats(statsData);
    } catch (err) {
      console.error("Error fetching products data", err);
      setError("Failed to load products. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);"""

content = content.replace(fetch_data_block, "")

# Replace handleToggleFeatured
toggle_featured_old = """  const handleToggleFeatured = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const updatedProduct = await productService.toggleFeatured(id);
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
      if (selectedProduct?.id === id) {
        setSelectedProduct({ ...selectedProduct, isFeatured: updatedProduct.isFeatured });
      }
    } catch (e) {
      console.error(e);
    }
  };"""

toggle_featured_new = """  const handleToggleFeatured = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const updatedProduct = await toggleFeaturedMutation.mutateAsync(id);
      if (selectedProduct?.id === id) {
        setSelectedProduct({ ...selectedProduct, isFeatured: updatedProduct.isFeatured });
      }
    } catch (e) {
      console.error(e);
    }
  };"""

content = content.replace(toggle_featured_old, toggle_featured_new)

# Replace confirmDelete
delete_old = """  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      setProducts(products.filter(p => p.id !== productToDelete.id));
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
  };"""

delete_new = """  const confirmDelete = async () => {
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
  };"""

content = content.replace(delete_old, delete_new)

# Replace handleModalSubmit
submit_old = """  const handleModalSubmit = async (productData: Partial<Product>) => {
    try {
      if (productToEdit) {
        const updated = await productService.updateProduct(productToEdit.id, productData);
        setProducts(products.map(p => p.id === updated.id ? updated : p));
        if (selectedProduct?.id === updated.id) {
          setSelectedProduct(updated);
        }
      } else {
        const created = await productService.createProduct(productData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
        setProducts([created, ...products]);
      }
    } catch (e) {
      console.error("Failed to save product", e);
      throw e; // Let the modal handle the error state
    }
  };"""

submit_new = """  const handleModalSubmit = async (productData: Partial<Product>) => {
    try {
      if (productToEdit) {
        const updated = await updateProductMutation.mutateAsync({ id: productToEdit.id, data: productData });
        if (selectedProduct?.id === updated.id) {
          setSelectedProduct(updated);
        }
      } else {
        await createProductMutation.mutateAsync(productData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
      }
    } catch (e) {
      console.error("Failed to save product", e);
      throw e; // Let the modal handle the error state
    }
  };"""

content = content.replace(submit_old, submit_new)

with open('src/dashboard/pages/admin/ProductsManagement.tsx', 'w') as f:
    f.write(content)
