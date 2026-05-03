import {useCallback, useEffect, useRef, useState} from 'react';
import type {CartItem} from '@/types';

const CART_STORAGE_KEY = 'roastery_cart';
const CART_EXPIRY_KEY = 'roastery_cart_expiry';
const CART_EXPIRY_DAYS = 7;

interface StoredCart {
  items: CartItem[];
  cartId: string | null;
}

function loadStoredCart(): StoredCart | null {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);
  const expiry = localStorage.getItem(CART_EXPIRY_KEY);

  if (storedCart && expiry) {
    const expiryDate = new Date(expiry);
    if (expiryDate > new Date()) {
      try {
        const parsed = JSON.parse(storedCart);
        return {items: parsed.items || [], cartId: parsed.cartId ?? null};
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function useCartStorage() {
  const isInitialMount = useRef(true);

  const [cartId, setCartId] = useState<string | null>(() => {
    const cart = loadStoredCart();
    return cart?.cartId ?? null;
  });
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const cart = loadStoredCart();
    return cart?.items ?? [];
  });

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartId(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_EXPIRY_KEY);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;

    if (cartItems.length > 0) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + CART_EXPIRY_DAYS);

      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          cartId,
          items: cartItems,
        })
      );
      localStorage.setItem(CART_EXPIRY_KEY, expiryDate.toISOString());
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_EXPIRY_KEY);
    }
  }, [cartItems, cartId]);

  const addItem = useCallback((item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.variantId === item.variantId);
      if (existing) {
        return prev.map(i =>
          i.variantId === item.variantId ? {...i, quantity: i.quantity + item.quantity} : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(i => i.variantId !== variantId));
    } else {
      setCartItems(prev => prev.map(i => (i.variantId === variantId ? {...i, quantity} : i)));
    }
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setCartItems(prev => prev.filter(i => i.variantId !== variantId));
  }, []);

  const getCartExpiry = useCallback(() => {
    const expiry = localStorage.getItem(CART_EXPIRY_KEY);
    return expiry ? new Date(expiry) : null;
  }, []);

  return {
    cartId,
    cartItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getCartExpiry,
  };
}
