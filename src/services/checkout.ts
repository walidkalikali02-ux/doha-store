import {api} from './api';
import type {Order, Address, ShippingMethod, PaymentMethod, ApiResponse} from '@/types';

interface CheckoutData {
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  discountCode?: string;
}

export const checkoutService = {
  async getShippingMethods(
    country: string,
    postalCode: string
  ): Promise<ApiResponse<{id: string; name: string; cost: number}[]>> {
    return api.get<ApiResponse<{id: string; name: string; cost: number}[]>>(
      '/checkout/shipping-methods',
      {params: {country, postalCode}}
    );
  },

  async createOrder(
    data: CheckoutData
  ): Promise<ApiResponse<{order: Order; clientSecret: string}>> {
    return api.post<ApiResponse<{order: Order; clientSecret: string}>>('/checkout', data);
  },

  async confirmPayment(orderId: string, paymentIntentId: string): Promise<ApiResponse<Order>> {
    return api.post<ApiResponse<Order>>(`/checkout/${orderId}/confirm`, {paymentIntentId});
  },
};
