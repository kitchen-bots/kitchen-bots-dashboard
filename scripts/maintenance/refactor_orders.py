import re

with open('src/dashboard/pages/customer/OrdersManagement.tsx', 'r') as f:
    content = f.read()

# Add useOrders, useDeleteOrder imports
content = re.sub(
    r"import { orderService } from '../../services/orderService';",
    "import { useOrders, useDeleteOrder } from '../../hooks/queries';\nimport { ErrorState } from '../../components/common/ErrorState';",
    content
)

# Replace the component body up to the return statement
new_body = """export const OrdersManagement = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const basePath = isAdmin ? '/admin/orders' : '/customer/orders';

  const { data: ordersData, isLoading, error, refetch } = useOrders();
  const deleteOrderMutation = useDeleteOrder();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <ErrorState message={error.message || 'An error occurred'} onRetry={() => refetch()} />
      </div>
    );
  }

  const orders = ordersData?.data || [];
  const totalOrders = orders.length;
"""

content = re.sub(
    r"export const OrdersManagement = \(\) => \{[\s\S]*?const totalOrders = orders\.length;",
    new_body,
    content
)

with open('src/dashboard/pages/customer/OrdersManagement.tsx', 'w') as f:
    f.write(content)
