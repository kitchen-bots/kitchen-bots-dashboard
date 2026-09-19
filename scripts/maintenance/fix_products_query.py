import re

with open('src/dashboard/pages/admin/ProductsManagement.tsx', 'r') as f:
    content = f.read()

# Replace imports
content = content.replace(
    "import { productService, ProductActivity } from '../../services/productService';",
    "import { productService, ProductActivity } from '../../services/productService';\nimport { useProducts, useProductActivity, useCategoryStats, useToggleFeatured, useDeleteProduct, useUpdateProduct, useCreateProduct } from '../../hooks/queries';"
)

# We need to add mutations in queries.ts for toggleFeatured first if it doesn't exist
