import {useState, useCallback, useEffect} from 'react';
import {CartContext} from './cartContextDef';
import type {Cart, CartItem} from '@/types';

export {CartContext} from './cartContextDef';
export type {CartContextType} from './cartContextDef';

export function CartProvider({children}: {children: React.ReactNode}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addItem = useCallback(async (variantId: string, quantity: number) => {
    setIsLoading(true);
    try {
      // TODO: API call to add item
      console.log('Adding item:', variantId, quantity);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      // TODO: API call to update quantity
      console.log('Updating quantity:', itemId, quantity);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      // TODO: API call to remove item
      console.log('Removing item:', itemId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const items = cart?.items || [];
  const itemCount = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  const total = cart?.summary.total || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        total,
        addItem,
        updateQuantity,
        removeItem,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
