import {api} from './api';
import type {GuestFormData} from '@/schemas/guest.schema';
import type {ApiResponse} from '@/types';

export interface GuestOrderRequest {
  guest: GuestFormData;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    phone: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  cartItems: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
  }>;
  discountCode?: string;
  notes?: string;
}

export interface GuestOrderResponse {
  orderId: string;
  orderNumber: string;
  trackingToken: string;
  trackingUrl: string;
  estimatedDelivery: string;
  email: string;
  total: number;
}

export interface OrderTrackingResponse {
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  estimatedDelivery: string;
  trackingNumber?: string;
  carrier?: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
    location?: string;
  }>;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
}

export const guestOrderService = {
  async createGuestOrder(data: GuestOrderRequest): Promise<ApiResponse<GuestOrderResponse>> {
    const response = await api.post<ApiResponse<GuestOrderResponse>>('/orders/guest', data);
    return response;
  },

  async trackOrderByToken(token: string): Promise<ApiResponse<OrderTrackingResponse>> {
    const response = await api.get<ApiResponse<OrderTrackingResponse>>(`/orders/track/${token}`);
    return response;
  },

  async trackOrderByEmail(
    email: string,
    orderNumber: string
  ): Promise<ApiResponse<OrderTrackingResponse>> {
    const response = await api.post<ApiResponse<OrderTrackingResponse>>('/orders/track', {
      email,
      orderNumber,
    });
    return response;
  },

  async resendConfirmationEmail(orderId: string): Promise<ApiResponse<{success: boolean}>> {
    const response = await api.post<ApiResponse<{success: boolean}>>(
      `/orders/${orderId}/resend-confirmation`
    );
    return response;
  },

  async validateGuestEmail(
    email: string
  ): Promise<ApiResponse<{valid: boolean; message?: string}>> {
    const response = await api.post<ApiResponse<{valid: boolean; message?: string}>>(
      '/orders/validate-email',
      {email}
    );
    return response;
  },

  async checkEmailExists(email: string): Promise<ApiResponse<{exists: boolean}>> {
    const response = await api.get<ApiResponse<{exists: boolean}>>(
      `/users/check-email?email=${encodeURIComponent(email)}`
    );
    return response;
  },

  async generateOrderTrackingUrl(token: string): Promise<{url: string}> {
    const baseUrl = window.location.origin;
    return {
      url: `${baseUrl}/order/track/${token}`,
    };
  },

  formatOrderNumber(id: number | string): string {
    const num = typeof id === 'string' ? parseInt(id, 10) : id;
    return `ORD-${new Date().getFullYear()}-${String(num).padStart(6, '0')}`;
  },

  generateTrackingToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  },
};
