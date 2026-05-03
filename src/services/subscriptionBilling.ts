import {api} from './api';
import type {ApiResponse} from '@/types';

export type BillingStatus = 'current' | 'past_due' | 'failed' | 'canceled' | 'pending';

export interface BillingInfo {
  subscriptionId: string;
  status: BillingStatus;
  nextBillingDate: string;
  nextPaymentAmount: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  lastPaymentStatus?: 'succeeded' | 'failed' | 'pending';
  failedPaymentAttempts: number;
  paymentMethodId: string;
  paymentMethodBrand?: string;
  paymentMethodLast4?: string;
}

export interface PaymentHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  paymentDate: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  failureReason?: string;
}

export interface BillingRetryConfig {
  maxAttempts: number;
  retryIntervals: number[];
  gracePeriodDays: number;
}

export const subscriptionBillingService = {
  async getBillingInfo(subscriptionId: string): Promise<ApiResponse<BillingInfo>> {
    const response = await api.get<ApiResponse<BillingInfo>>(
      `/subscriptions/${subscriptionId}/billing`
    );
    return response;
  },

  async getPaymentHistory(
    subscriptionId: string,
    page?: number,
    perPage?: number
  ): Promise<ApiResponse<PaymentHistory[]>> {
    const params = new URLSearchParams();
    if (page) params.append('page', String(page));
    if (perPage) params.append('perPage', String(perPage));

    const response = await api.get<ApiResponse<PaymentHistory[]>>(
      `/subscriptions/${subscriptionId}/billing/history?${params.toString()}`
    );
    return response;
  },

  async updatePaymentMethod(
    subscriptionId: string,
    paymentMethodId: string
  ): Promise<ApiResponse<BillingInfo>> {
    const response = await api.patch<ApiResponse<BillingInfo>>(
      `/subscriptions/${subscriptionId}/billing/payment-method`,
      {paymentMethodId}
    );
    return response;
  },

  async retryFailedPayment(subscriptionId: string): Promise<ApiResponse<BillingInfo>> {
    const response = await api.post<ApiResponse<BillingInfo>>(
      `/subscriptions/${subscriptionId}/billing/retry`,
      {}
    );
    return response;
  },

  async getBillingRetryConfig(): Promise<ApiResponse<BillingRetryConfig>> {
    const response = await api.get<ApiResponse<BillingRetryConfig>>(
      '/subscriptions/billing/retry-config'
    );
    return response;
  },

  async getPendingPayments(): Promise<
    ApiResponse<
      Array<{
        subscriptionId: string;
        subscriptionName: string;
        amount: number;
        dueDate: string;
        daysPastDue: number;
      }>
    >
  > {
    const response = await api.get<
      ApiResponse<
        Array<{
          subscriptionId: string;
          subscriptionName: string;
          amount: number;
          dueDate: string;
          daysPastDue: number;
        }>
      >
    >('/subscriptions/billing/pending');
    return response;
  },

  async processBillingCycle(): Promise<
    ApiResponse<{
      processed: number;
      failed: number;
      total: number;
    }>
  > {
    const response = await api.post<
      ApiResponse<{
        processed: number;
        failed: number;
        total: number;
      }>
    >('/admin/subscriptions/billing/process-cycle', {});
    return response;
  },

  async getBillingStats(): Promise<
    ApiResponse<{
      activeSubscriptions: number;
      monthlyRevenue: number;
      failedPayments: number;
      churnRate: number;
    }>
  > {
    const response = await api.get<
      ApiResponse<{
        activeSubscriptions: number;
        monthlyRevenue: number;
        failedPayments: number;
        churnRate: number;
      }>
    >('/admin/subscriptions/billing/stats');
    return response;
  },
};
