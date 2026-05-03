import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {orderService} from '../../services/order';
import type {Order, OrderStatus} from '../../types/order';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getAdminHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? {Authorization: `Bearer ${token}`} : {}),
  };
}

export interface AdminOrdersParams {
  search?: string;
  status?: string;
  sortBy?: 'createdAt' | 'total';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AdminOrderDetail extends Order {
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

async function fetchAdminOrders(params: AdminOrdersParams): Promise<{
  orders: AdminOrderDetail[];
  total: number;
  page: number;
  pages: number;
}> {
  const {page = 1, limit = 50, ...rest} = params;
  const offset = (page - 1) * limit;
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(rest.sortBy && {sortBy: rest.sortBy}),
    ...(rest.sortDir && {sortDir: rest.sortDir}),
    ...(rest.search && {search: rest.search}),
    ...(rest.status && rest.status !== 'all' ? {status: rest.status} : {}),
  });

  const response = await fetch(`${API_URL}/api/v1/orders/admin/orders?${query}`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to fetch orders'}));
    throw new Error(error.message || 'Failed to fetch orders');
  }

  return response.json();
}

async function fetchAdminOrderDetail(orderId: string): Promise<{order: AdminOrderDetail}> {
  const response = await fetch(`${API_URL}/api/v1/orders/admin/orders/${orderId}`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to fetch order'}));
    throw new Error(error.message || 'Failed to fetch order');
  }

  return response.json();
}

async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{order: Order}> {
  const response = await fetch(`${API_URL}/api/v1/orders/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({status}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to update status'}));
    throw new Error(error.message || 'Failed to update status');
  }

  return response.json();
}

async function refundOrder(orderId: string): Promise<{order: Order; success: boolean}> {
  const response = await fetch(`${API_URL}/api/v1/orders/admin/orders/${orderId}/refund`, {
    method: 'POST',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to process refund'}));
    throw new Error(error.message || 'Failed to process refund');
  }

  return response.json();
}

export function useAdminOrders(params: AdminOrdersParams) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => fetchAdminOrders(params),
    staleTime: 30000,
  });
}

export function useAdminOrderDetail(orderId: string | null) {
  return useQuery({
    queryKey: ['admin', 'orders', orderId],
    queryFn: () => fetchAdminOrderDetail(orderId!),
    enabled: !!orderId,
    staleTime: 30000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({orderId, status}: {orderId: string; status: OrderStatus}) =>
      updateOrderStatus(orderId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ['admin', 'orders']});
      if (data.order?.id) {
        queryClient.setQueryData(['admin', 'orders', data.order.id], {order: data.order});
      }
    },
  });
}

export function useRefundOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => refundOrder(orderId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({queryKey: ['admin', 'orders']});
      if (data.order?.id) {
        queryClient.setQueryData(['admin', 'orders', data.order.id], {order: data.order});
      }
    },
  });
}

export default {
  useAdminOrders,
  useAdminOrderDetail,
  useUpdateOrderStatus,
  useRefundOrder,
};