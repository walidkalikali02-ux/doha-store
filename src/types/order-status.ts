import type { OrderStatus } from './order';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'payment_failed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  payment_failed: ['pending', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['cancelled'],
  cancelled: [],
  refunded: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (to === 'cancelled') return true;
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
  return isValidTransition(current, next);
}

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    payment_failed: 'Payment Failed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return labels[status] ?? status;
}

export function isFinalStatus(status: OrderStatus): boolean {
  return ['delivered', 'cancelled', 'refunded'].includes(status);
}