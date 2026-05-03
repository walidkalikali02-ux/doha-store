import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import type {Product} from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getAdminHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? {Authorization: `Bearer ${token}`} : {}),
  };
}

export interface AdminProductsParams {
  search?: string;
  status?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

interface AdminProduct extends Product {
  variants: Array<{
    id: string;
    sku: string;
    name: string;
    price: number;
    quantity: number;
    product_id: string;
  }>;
}

async function fetchAdminProducts(params: AdminProductsParams): Promise<{
  products: AdminProduct[];
  total: number;
  page: number;
  pages: number;
}> {
  const {page = 1, limit = 50, ...rest} = params;
  const offset = (page - 1) * limit;
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(rest.search && {search: rest.search}),
    ...(rest.status && rest.status !== 'all' ? {status: rest.status} : {}),
    ...(rest.lowStock ? {lowStock: 'true'} : {}),
  });

  const response = await fetch(`${API_URL}/api/v1/products/admin/products?${query}`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to fetch products'}));
    throw new Error(error.message || 'Failed to fetch products');
  }

  return response.json();
}

interface InventoryUpdateResult {
  variant: {
    id: string;
    quantity: number;
    product_id: string;
  };
}

async function updateInventory(
  productId: string,
  variantId: string,
  quantity: number,
  reason: string
): Promise<InventoryUpdateResult> {
  const response = await fetch(
    `${API_URL}/api/v1/products/admin/products/${productId}/variants/${variantId}/inventory`,
    {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({quantity, reason}),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to update inventory'}));
    throw new Error(error.message || 'Failed to update inventory');
  }

  return response.json();
}

export function useAdminProducts(params: AdminProductsParams) {
  return useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => fetchAdminProducts(params),
    staleTime: 30000,
  });
}

export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      quantity,
      reason,
    }: {
      productId: string;
      variantId: string;
      quantity: number;
      reason: string;
    }) => updateInventory(productId, variantId, quantity, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['admin', 'products']});
    },
  });
}

export default {
  useAdminProducts,
  useUpdateInventory,
};