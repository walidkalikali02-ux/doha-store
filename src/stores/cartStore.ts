import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useMemo } from 'react';
import type { CartItem } from '../types/cart';

interface CartState {
  items: CartItem[];
  discountCode: string | null;
  isLoading: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscountCode: (code: string | null) => void;
  snapshotCart: (pendingOrderId?: string) => void;
  restoreSnapshot: () => CartItem[] | null;
  clearSnapshot: () => void;
  hasSnapshot: () => boolean;
}

const STORAGE_KEY = 'roastery-cart';
const SNAPSHOT_KEY = 'roastery-cart-snapshot';
const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000;

interface Snapshot {
  items: CartItem[];
  discountCode: string | null;
  timestamp: number;
  pendingOrderId?: string;
}

function getSnapshot(): Snapshot | null {
  if (typeof window === 'undefined') return null;

  const data = localStorage.getItem(SNAPSHOT_KEY);
  if (!data) return null;

  try {
    const snapshot: Snapshot = JSON.parse(data);
    const age = Date.now() - snapshot.timestamp;

    if (age > SNAPSHOT_TTL_MS) {
      localStorage.removeItem(SNAPSHOT_KEY);
      return null;
    }

    return snapshot;
  } catch {
    localStorage.removeItem(SNAPSHOT_KEY);
    return null;
  }
}

function saveSnapshot(items: CartItem[], discountCode: string | null, pendingOrderId?: string): void {
  if (typeof window === 'undefined') return;

  const snapshot: Snapshot = {
    items,
    discountCode,
    timestamp: Date.now(),
    pendingOrderId,
  };

  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

function clearSnapshotStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SNAPSHOT_KEY);
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        discountCode: null,
        isLoading: false,

        addItem: (item) =>
          set(
            (state) => {
              const existing = state.items.find((i) => i.variantId === item.variantId);
              if (existing) {
                return {
                  items: state.items.map((i) =>
                    i.variantId === item.variantId
                      ? { ...i, quantity: i.quantity + item.quantity }
                      : i
                  ),
                };
              }
              return { items: [...state.items, item] };
            },
            { name: 'cart-add-item' }
          ),

        removeItem: (variantId) =>
          set(
            (state) => ({ items: state.items.filter((i) => i.variantId !== variantId) }),
            { name: 'cart-remove-item' }
          ),

        updateQuantity: (variantId, quantity) =>
          set(
            (state) => ({
              items:
                quantity <= 0
                  ? state.items.filter((i) => i.variantId !== variantId)
                  : state.items.map((i) =>
                      i.variantId === variantId ? { ...i, quantity } : i
                    ),
            }),
            { name: 'cart-update-quantity' }
          ),

        clearCart: () => set({ items: [], discountCode: null }, { name: 'cart-clear' }),

        setDiscountCode: (code) =>
          set({ discountCode: code }, { name: 'cart-set-discount' }),

        snapshotCart: (pendingOrderId?: string) => {
          const { items, discountCode } = get();
          if (items.length > 0) {
            saveSnapshot(items, discountCode, pendingOrderId);
          }
        },

        restoreSnapshot: () => {
          const snapshot = getSnapshot();
          if (snapshot) {
            set({
              items: snapshot.items,
              discountCode: snapshot.discountCode,
            });
            return snapshot.items;
          }
          return null;
        },

        clearSnapshot: () => {
          clearSnapshotStorage();
        },

        hasSnapshot: () => {
          return getSnapshot() !== null;
        },
      }),
      {
        name: STORAGE_KEY,
        partialize: (state) => ({
          items: state.items,
          discountCode: state.discountCode,
        }),
      }
    ),
    { name: 'CartStore' }
  )
);

export function useCartItems() {
  return useCartStore((state) => state.items);
}

export function useCartSummary() {
  const items = useCartItems();

  return useMemo(() => {
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const estimatedShipping = 0;
    const estimatedTax = Math.round(subtotal * 0.08);
    const total = subtotal + estimatedShipping + estimatedTax;

    return {
      itemCount,
      subtotal,
      discount: 0,
      estimatedShipping,
      estimatedTax,
      total,
    };
  }, [items]);
}

export { SNAPSHOT_KEY, SNAPSHOT_TTL_MS };
export type { Snapshot };
export default useCartStore;
