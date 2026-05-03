import { useCallback, useEffect, useState } from 'react';
import { useCartStore } from '../stores/cartStore';
import type { CartItem } from '../types/cart';

export interface SnapshotInfo {
  hasSnapshot: boolean;
  items: CartItem[];
  discountCode: string | null;
  timestamp: number;
  age: number;
  pendingOrderId?: string;
}

export function useCartSnapshot() {
  const store = useCartStore();
  const [snapshotInfo, setSnapshotInfo] = useState<SnapshotInfo | null>(null);

  const checkSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return;

    const snapshot = localStorage.getItem('roastery-cart-snapshot');
    if (!snapshot) {
      setSnapshotInfo(null);
      return;
    }

    try {
      const parsed = JSON.parse(snapshot);
      const age = Date.now() - parsed.timestamp;
      const TTL_MS = 24 * 60 * 60 * 1000;

      if (age > TTL_MS) {
        localStorage.removeItem('roastery-cart-snapshot');
        setSnapshotInfo(null);
        return;
      }

      setSnapshotInfo({
        hasSnapshot: true,
        items: parsed.items,
        discountCode: parsed.discountCode,
        timestamp: parsed.timestamp,
        age,
        pendingOrderId: parsed.pendingOrderId,
      });
    } catch {
      setSnapshotInfo(null);
    }
  }, []);

  useEffect(() => {
    checkSnapshot();
  }, [checkSnapshot]);

  const snapshotCart = useCallback((pendingOrderId?: string) => {
    store.snapshotCart(pendingOrderId);
    checkSnapshot();
  }, [store, checkSnapshot]);

  const restoreCart = useCallback(() => {
    const items = store.restoreSnapshot();
    checkSnapshot();
    return items;
  }, [store, checkSnapshot]);

  const clearSnapshot = useCallback(() => {
    store.clearSnapshot();
    setSnapshotInfo(null);
  }, [store]);

  const shouldOfferRestore = useCallback(() => {
    return snapshotInfo?.hasSnapshot && snapshotInfo.items.length > 0;
  }, [snapshotInfo]);

  return {
    snapshotInfo,
    snapshotCart,
    restoreCart,
    clearSnapshot,
    shouldOfferRestore,
  };
}

export function useClearCartOnConfirmation(orderId: string | null, isConfirmed: boolean) {
  const store = useCartStore();

  useEffect(() => {
    if (orderId && isConfirmed) {
      store.clearCart();
      store.clearSnapshot();
    }
  }, [orderId, isConfirmed, store]);
}

export default useCartSnapshot;