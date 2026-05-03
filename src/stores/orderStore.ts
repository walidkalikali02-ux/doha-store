import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '../types/order';
import type { PaymentMethod } from '../services/order';

interface SessionRecoveryData {
  orderId: string | null;
  mfInvoiceId: string | null;
  orderNumber: string | null;
}

interface OrderState {
  currentOrder: Order | null;
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  selectedPaymentMethod: PaymentMethod | null;
  selectedPaymentMethodId: number | null;
  sessionRecovery: SessionRecoveryData;
  setOrder: (order: Order | null) => void;
  clearOrder: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  setPaymentMethodId: (methodId: number | null) => void;
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  reset: () => void;
}

const initialState = {
  currentOrder: null,
  orders: [],
  isLoading: false,
  error: null,
  selectedPaymentMethod: null,
  selectedPaymentMethodId: null,
  sessionRecovery: {
    orderId: null,
    mfInvoiceId: null,
    orderNumber: null,
  },
};

const SESSION_KEY = 'roastery-order-session';

function persistToSession(order: Order | null) {
  if (typeof window === 'undefined') return;

  if (order) {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        orderId: order.id,
        mfInvoiceId: order.mfInvoiceId,
        orderNumber: order.orderNumber,
      })
    );
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export const useOrderStore = create<OrderState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setOrder: (order) => {
          persistToSession(order);
          set({ currentOrder: order, error: null }, { name: 'order-set-order' });
        },

        clearOrder: () => {
          persistToSession(null);
          set({ currentOrder: null, selectedPaymentMethod: null, error: null }, { name: 'order-clear' });
        },

        setError: (error) => set({ error }, { name: 'order-set-error' }),

        setLoading: (isLoading) => set({ isLoading }, { name: 'order-set-loading' }),

        setPaymentMethod: (method) =>
          set({ selectedPaymentMethod: method }, { name: 'order-set-payment-method' }),

        setPaymentMethodId: (methodId) =>
          set({ selectedPaymentMethodId: methodId }, { name: 'order-set-payment-method-id' }),

        setOrders: (orders) => set({ orders }, { name: 'order-set-orders' }),

        updateOrderStatus: (orderId, status) =>
          set(
            (state) => {
              const updatedOrder = state.currentOrder?.id === orderId
                ? { ...state.currentOrder, status }
                : state.currentOrder;

              if (updatedOrder) {
                persistToSession(updatedOrder as Order);
              }

              return {
                orders: state.orders.map((o) =>
                  o.id === orderId ? { ...o, status } : o
                ),
                currentOrder: updatedOrder,
              };
            },
            { name: 'order-update-status' }
          ),

        reset: () => {
          persistToSession(null);
          set(initialState, { name: 'order-reset' });
        },
      }),
      {
        name: 'roastery-order-store',
        partialize: (state) => ({
          sessionRecovery: state.sessionRecovery,
        }),
        storage: {
          getItem: (key) => {
            const value = sessionStorage.getItem(key);
            return value ? JSON.parse(value) : null;
          },
          setItem: (key, value) => {
            sessionStorage.setItem(key, JSON.stringify(value));
          },
          removeItem: (key) => {
            sessionStorage.removeItem(key);
          },
        },
      }
    ),
    { name: 'OrderStore' }
  )
);

export function getSessionRecovery(): SessionRecoveryData | null {
  if (typeof window === 'undefined') return null;

  const data = sessionStorage.getItem(SESSION_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data) as SessionRecoveryData;
  } catch {
    return null;
  }
}

export function clearSessionRecovery(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}

export default useOrderStore;