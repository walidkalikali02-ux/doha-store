import type {CartItem} from '@/types';

const CART_SESSION_COOKIE = 'cart_session_id';
const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CartSessionResponse {
  sessionId: string;
  items: CartItem[];
  discountCode: string | null;
}

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

function getLocalStorageCart(): {items: CartItem[]; discountCode: string | null} | null {
  try {
    const stored = localStorage.getItem('roastery_cart');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return {items: parsed.items || [], discountCode: parsed.discountCode || null};
  } catch {
    return null;
  }
}

function setLocalStorageCart(items: CartItem[], discountCode: string | null): void {
  try {
    localStorage.setItem(
      'roastery_cart',
      JSON.stringify({items, discountCode, updatedAt: Date.now()})
    );
  } catch {
  }
}

function clearLocalStorageCart(): void {
  localStorage.removeItem('roastery_cart');
}

export function useRedisCart() {
  let baseURL: string;
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
    baseURL = (import.meta as any).env.VITE_API_URL;
  } else {
    baseURL = 'http://localhost:3001';
  }

  const apiBase = `${baseURL}/api/v1`;

  async function getCart(): Promise<{items: CartItem[]; discountCode: string | null}> {
    const sessionId = getCookie(CART_SESSION_COOKIE);
    if (!sessionId) {
      return getLocalStorageCart() || {items: [], discountCode: null};
    }

    try {
      const response = await fetch(`${apiBase}/cart?sessionId=${encodeURIComponent(sessionId)}`);
      if (response.ok) {
        const data: CartSessionResponse = await response.json();
        return {items: data.items, discountCode: data.discountCode};
      }
    } catch {
    }

    return getLocalStorageCart() || {items: [], discountCode: null};
  }

  async function setCart(
    items: CartItem[],
    discountCode: string | null
  ): Promise<{sessionId: string; isRedis: boolean}> {
    const existingSessionId = getCookie(CART_SESSION_COOKIE);
    const sessionId = existingSessionId || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    setCookie(CART_SESSION_COOKIE, sessionId, CART_TTL_MS);

    let isRedis = false;

    try {
      const response = await fetch(`${apiBase}/cart`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sessionId, items, discountCode}),
      });
      if (response.ok) {
        isRedis = true;
      }
    } catch {
    }

    setLocalStorageCart(items, discountCode);

    return {sessionId, isRedis};
  }

  async function clearCart(): Promise<void> {
    const sessionId = getCookie(CART_SESSION_COOKIE);
    if (sessionId) {
      try {
        await fetch(`${apiBase}/cart?sessionId=${encodeURIComponent(sessionId)}`, {
          method: 'DELETE',
        });
      } catch {
      }
    }

    deleteCookie(CART_SESSION_COOKIE);
    clearLocalStorageCart();
  }

  return {
    getCart,
    setCart,
    clearCart,
  };
}

export default useRedisCart;
