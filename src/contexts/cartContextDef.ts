import {createContext} from 'react';
import type {Cart, CartItem} from '@/types';

export interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  isLoading: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
