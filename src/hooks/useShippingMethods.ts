import {useQuery} from '@tanstack/react-query';
import {api} from '@/services/api';

interface ShippingMethodOption {
  method: string;
  label: string;
  cost: number;
  estimatedDays: string;
}

interface ShippingMethodsResponse {
  methods: ShippingMethodOption[];
}

interface UseShippingMethodsOptions {
  address: {
    city?: string;
    area?: string;
    country?: string;
  };
  cartItems: Array<{
    productId: string;
    quantity: number;
    price?: number;
    weight?: number;
  }>;
  enabled?: boolean;
}

export function useShippingMethods({address, cartItems, enabled = true}: UseShippingMethodsOptions) {
  return useQuery({
    queryKey: ['shippingMethods', address.city, address.area, cartItems],
    queryFn: async (): Promise<ShippingMethodOption[]> => {
      const response = await api.post<ShippingMethodsResponse>('/shipping', {address, cartItems});
      return response.methods || [];
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function getCheapestMethod(methods: ShippingMethodOption[]): ShippingMethodOption | null {
  if (methods.length === 0) return null;
  return methods.reduce((cheapest, method) =>
    method.cost < cheapest.cost ? method : cheapest
  );
}

export type {ShippingMethodOption};