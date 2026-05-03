import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOrderStore } from '../stores/orderStore';
import { useCheckoutStore } from '../stores/checkoutStore';
import { orderService } from '../services/order';
import type { Order } from '../types/order';

const ACTIVE_STATUSES: Order['status'][] = ['pending', 'confirmed', 'processing', 'payment_failed'];
const POLL_INTERVAL = 5000;

export function useOrder(orderId: string | null, token?: string) {
  const store = useOrderStore();
  const checkoutStore = useCheckoutStore();
  const queryClient = useQueryClient();

  const isActiveOrder = (order: Order | undefined) => {
    return order && ACTIVE_STATUSES.includes(order.status);
  };

  const handleStatusTransition = (order: Order) => {
    if (order.status === 'confirmed') {
      store.setOrder(order);
      checkoutStore.reset();
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('order-confirmed', { detail: { order } });
        window.dispatchEvent(event);
      }
    } else if (order.status === 'payment_failed') {
      store.setOrder(order);
    }
  };

  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrder(orderId!, token),
    enabled: !!orderId,
    refetchInterval: (data) => {
      const order = data?.order;
      if (isActiveOrder(order)) {
        return POLL_INTERVAL;
      }
      return false;
    },
    refetchIntervalInBackground: false,
    staleTime: 3000,
  });

  if (query.data?.order) {
    const prevOrder = store.currentOrder;
    if (prevOrder?.status !== query.data.order.status) {
      handleStatusTransition(query.data.order);
    }
  }

  const setOrder = (order: Order | null) => {
    store.setOrder(order);
    if (order) {
      queryClient.setQueryData(['order', order.id], { order });
      handleStatusTransition(order);
    }
  };

  const clearOrder = () => {
    store.clearOrder();
    if (orderId) {
      queryClient.removeQueries({ queryKey: ['order', orderId] });
    }
  };

  return {
    order: query.data?.order ?? store.currentOrder,
    isLoading: query.isLoading || store.currentOrder === null && !!orderId,
    error: query.error?.message || store.error,
    refetch: query.refetch,
    setOrder,
    clearOrder,
    setError: store.setError,
    setPaymentMethod: store.setPaymentMethod,
    setPaymentMethodId: store.setPaymentMethodId,
    selectedPaymentMethod: store.selectedPaymentMethod,
    selectedPaymentMethodId: store.selectedPaymentMethodId,
  };
}

export function useOrderByNumber(orderNumber: string, email: string) {
  const store = useOrderStore();

  const query = useQuery({
    queryKey: ['order', 'track', orderNumber, email],
    queryFn: () => orderService.getOrderByNumber(orderNumber, email),
    enabled: !!orderNumber && !!email,
    staleTime: 10000,
  });

  return {
    order: query.data?.order ?? store.currentOrder,
    isLoading: query.isLoading,
    error: query.error?.message || store.error,
    refetch: query.refetch,
    setOrder: store.setOrder,
    clearOrder: store.clearOrder,
  };
}

export function useOrderPolling(orderId: string | null, token?: string) {
  const store = useOrderStore();
  const checkoutStore = useCheckoutStore();

  const query = useQuery({
    queryKey: ['order', 'poll', orderId],
    queryFn: () => orderService.getOrder(orderId!, token),
    enabled: !!orderId,
    refetchInterval: (data) => {
      if (data?.order && ACTIVE_STATUSES.includes(data.order.status)) {
        return POLL_INTERVAL;
      }
      return false;
    },
    refetchIntervalInBackground: false,
    staleTime: 2000,
  });

  if (query.data?.order) {
    const prevOrder = store.currentOrder;
    if (prevOrder?.status !== query.data.order.status) {
      if (query.data.order.status === 'confirmed') {
        store.setOrder(query.data.order);
        checkoutStore.reset();
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('order-confirmed', { detail: { order: query.data.order } });
          window.dispatchEvent(event);
        }
      } else if (query.data.order.status === 'payment_failed') {
        store.setOrder(query.data.order);
      }
    }
  }

  return {
    order: query.data?.order ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}

export function usePaymentRetry(orderId: string | null) {
  const store = useOrderStore();
  const { selectedPaymentMethodId } = store;

  const initiateRetry = async (): Promise<string | null> => {
    if (!orderId || !selectedPaymentMethodId) {
      return null;
    }

    const { executeMyFatoorahPayment } = await import('../services/order');
    const order = await orderService.getOrder(orderId);

    const result = await executeMyFatoorahPayment({
      orderId,
      paymentMethodId: selectedPaymentMethodId,
      customerName: order.order.customerName || 'Customer',
      customerEmail: order.order.customerEmail || '',
      customerMobile: order.order.customerMobile || undefined,
      successUrl: `${window.location.origin}/order/${order.order.orderNumber}/confirmation`,
      errorUrl: `${window.location.origin}/checkout/payment-failed?orderId=${orderId}`,
    });

    return result.InvoiceURL;
  };

  return {
    initiateRetry,
    selectedPaymentMethodId,
    hasPaymentMethod: selectedPaymentMethodId !== null,
  };
}

export default useOrder;