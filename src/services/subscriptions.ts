import {api} from './api';
import type {Subscription, SubscriptionItem, SubscriptionHistory, ApiResponse} from '@/types';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due';
export type SubscriptionFrequency = 'weekly' | 'bi_weekly' | 'monthly';

export interface CreateSubscriptionData {
  variantId: string;
  quantity: number;
  frequency: SubscriptionFrequency;
  shippingAddressId: string;
  paymentMethodId: string;
  discountCode?: string;
}

export interface UpdateSubscriptionData {
  frequency?: SubscriptionFrequency;
  shippingAddressId?: string;
  paymentMethodId?: string;
  items?: Array<{
    id: string;
    quantity: number;
  }>;
}

export interface SubscriptionListItem {
  id: string;
  status: SubscriptionStatus;
  frequency: SubscriptionFrequency;
  nextBillingDate: string;
  nextDeliveryDate: string;
  totalItems: number;
  totalAmount: number;
  discountPercent: number;
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  frequency?: SubscriptionFrequency;
  page?: number;
  perPage?: number;
}

export const subscriptionService = {
  async getSubscriptions(
    filters?: SubscriptionFilters
  ): Promise<ApiResponse<SubscriptionListItem[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.frequency) params.append('frequency', filters.frequency);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.perPage) params.append('perPage', String(filters.perPage));

    const response = await api.get<ApiResponse<SubscriptionListItem[]>>(
      `/subscriptions?${params.toString()}`
    );
    return response;
  },

  async getSubscriptionById(id: string): Promise<ApiResponse<Subscription>> {
    const response = await api.get<ApiResponse<Subscription>>(`/subscriptions/${id}`);
    return response;
  },

  async createSubscription(data: CreateSubscriptionData): Promise<ApiResponse<Subscription>> {
    const response = await api.post<ApiResponse<Subscription>>('/subscriptions', data);
    return response;
  },

  async updateSubscription(
    id: string,
    data: UpdateSubscriptionData
  ): Promise<ApiResponse<Subscription>> {
    const response = await api.patch<ApiResponse<Subscription>>(`/subscriptions/${id}`, data);
    return response;
  },

  async pauseSubscription(id: string): Promise<ApiResponse<Subscription>> {
    const response = await api.post<ApiResponse<Subscription>>(`/subscriptions/${id}/pause`, {});
    return response;
  },

  async resumeSubscription(id: string): Promise<ApiResponse<Subscription>> {
    const response = await api.post<ApiResponse<Subscription>>(`/subscriptions/${id}/resume`, {});
    return response;
  },

  async cancelSubscription(id: string, reason?: string): Promise<ApiResponse<Subscription>> {
    const response = await api.post<ApiResponse<Subscription>>(`/subscriptions/${id}/cancel`, {
      reason,
    });
    return response;
  },

  async skipDelivery(id: string, skipDate?: string): Promise<ApiResponse<Subscription>> {
    const response = await api.post<ApiResponse<Subscription>>(
      `/subscriptions/${id}/skip-delivery`,
      {skipDate}
    );
    return response;
  },

  async addSubscriptionItem(
    subscriptionId: string,
    variantId: string,
    quantity: number
  ): Promise<ApiResponse<SubscriptionItem>> {
    const response = await api.post<ApiResponse<SubscriptionItem>>(
      `/subscriptions/${subscriptionId}/items`,
      {variantId, quantity}
    );
    return response;
  },

  async updateSubscriptionItem(
    subscriptionId: string,
    itemId: string,
    quantity: number
  ): Promise<ApiResponse<SubscriptionItem>> {
    const response = await api.patch<ApiResponse<SubscriptionItem>>(
      `/subscriptions/${subscriptionId}/items/${itemId}`,
      {quantity}
    );
    return response;
  },

  async removeSubscriptionItem(subscriptionId: string, itemId: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `/subscriptions/${subscriptionId}/items/${itemId}`
    );
    return response;
  },

  async getSubscriptionHistory(
    id: string,
    page?: number,
    perPage?: number
  ): Promise<ApiResponse<SubscriptionHistory[]>> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (perPage) params.append('perPage', String(perPage));

    const response = await api.get<ApiResponse<SubscriptionHistory[]>>(
      `/subscriptions/${id}/history?${params.toString()}`
    );
    return response;
  },

  async getUpcomingDeliveries(
    page?: number,
    perPage?: number
  ): Promise<
    ApiResponse<
      Array<{
        subscriptionId: string;
        productName: string;
        productImage: string;
        quantity: number;
        scheduledDate: string;
        status: 'scheduled' | 'processing' | 'shipped';
      }>
    >
  > {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (perPage) params.append('perPage', String(perPage));

    const response = await api.get<
      ApiResponse<
        Array<{
          subscriptionId: string;
          productName: string;
          productImage: string;
          quantity: number;
          scheduledDate: string;
          status: 'scheduled' | 'processing' | 'shipped';
        }>
      >
    >(`/subscriptions/upcoming-deliveries?${params.toString()}`);
    return response;
  },
};
