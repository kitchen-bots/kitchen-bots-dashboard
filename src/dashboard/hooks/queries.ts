import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CommerceProductService } from '../services/commerce';
import { orderService } from '../services/orderService';
import { leadService } from '../services/leadService';
import { Order, Lead } from '../types';
import { CommerceProduct } from '../types/commerce';
import { PaginationParams } from '../services/types';

// -- Products --

export const useProducts = (params?: PaginationParams & { status?: string, category?: string, search?: string }) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => CommerceProductService.getProducts(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => CommerceProductService.getProductById(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CommerceProduct, 'id' | 'createdAt' | 'updatedAt'>) => CommerceProductService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CommerceProduct> }) => CommerceProductService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CommerceProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
    },
  });
};

export const useToggleFeatured = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const product = await CommerceProductService.getProductById(id);
      return CommerceProductService.updateProduct(id, { isFeatured: !product.isFeatured });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
};

export const useCategoryStats = () => {
  return useQuery({
    queryKey: ['categoryStats'],
    queryFn: () => CommerceProductService.getCategoryStats(),
  });
};

export const useProductActivity = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['productActivity', params],
    // Stubbing this since CommerceProductService doesn't have activity yet
    queryFn: async () => ({ data: [], total: 0 }),
  });
};

// -- Orders --

export const useOrders = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) => orderService.updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
};

// -- Leads --

export const useLeads = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadService.getLeads(params),
  });
};

export const useLead = (id: string) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadService.getLeadById(id),
    enabled: !!id,
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Lead['status'] }) => leadService.updateLeadStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useCRMActivities = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['crmActivities', params],
    queryFn: () => leadService.getCRMActivities(params),
  });
};

export const useFollowUpTasks = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['followUpTasks', params],
    queryFn: () => leadService.getFollowUpTasks(params),
  });
};


