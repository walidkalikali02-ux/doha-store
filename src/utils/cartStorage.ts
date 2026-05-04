import {useCallback, useEffect, useRef, useState} from 'react';
import type {CartItem} from '@/types';

const CART_STORAGE_KEY = 'roastery_cart';
const CART_EXPIRY_KEY = 'roastery_cart_expiry';
const CART_EXPIRY_DAYS = 7;

interface StoredCart {
  items: CartItem[];
  cartId: string | null;
}

const CART_SESSION_COOKIE = 'cart_session_id';
const CART_TTL_MS = CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAgeMs: number): void {
  const maxAge = Math.floor(maxAgeMs / 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; max-age=0; path=/`;
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

async function syncToRedis(items: CartItem[], discountCode: string | null, sessionId: string): Promise<boolean> {
  try {
    let baseURL = 'http://localhost:3001';
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
      baseURL = (import.meta as any).env.VITE_API_URL;
    }
    const apiBase = `${baseURL}/api/v1`;

    const response = await fetch(`${apiBase}/cart`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({sessionId, items, discountCode}),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function loadFromRedis(sessionId: string): Promise<StoredCart | null> {
  try {
    let baseURL = 'http://localhost:3001';
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
      baseURL = (import.meta as any).env.VITE_API_URL;
    }
    const apiBase = `${baseURL}/api/v1`;

    const response = await fetch(`${apiBase}/cart?sessionId=${encodeURIComponent(sessionId)}`);
    if (response.ok) {
      const data = await response.json();
      return {items: data.items || [], cartId: data.sessionId};
    }
  } catch {
  }
  return null;
}

export function useCartStorage() {
  const isInitialMount = useRef(true);
  const redisSynced = useRef(false);

  const [cartId, setCartId] = useState<string | null>(() => {
    const stored = loadStoredCart();
    return stored?.cartId ?? getCookie(CART_SESSION_COOKIE) ?? null;
  });
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const stored = loadStoredCart();
    return stored?.items ?? [];
  });

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;
    const sessionId = cartId || getCookie(CART_SESSION_COOKIE);
    if (sessionId && cartItems.length > 0) {
      syncToRedis(cartItems, null, sessionId);
    }
  }, [cartItems, cartId]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartId(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_EXPIRY_KEY);
    const sessionId = getCookie(CART_SESSION_COOKIE);
    if (sessionId) {
      deleteCookie(CART_SESSION_COOKIE);
      try {
        let baseURL = 'http://localhost:3001';
        if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
          baseURL = (import.meta as any).env.VITE_API_URL;
        }
        fetch(`${baseURL}/api/v1/cart?sessionId=${encodeURIComponent(sessionId)}`, {method: 'DELETE'}).catch(() => {});
      } catch {
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;

    if (cartItems.length > 0) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + CART_EXPIRY_DAYS);

      let sessionId = cartId || getCookie(CART_SESSION_COOKIE);
      if (!sessionId) {
        sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        setCartId(sessionId);
        setCookie(CART_SESSION_COOKIE, sessionId, CART_TTL_MS);
      }

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
