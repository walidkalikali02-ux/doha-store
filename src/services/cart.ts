import {api} from './api';
import type {Cart, CartItem, ApiResponse} from '@/types';

export const cartService = {
  async getCart(): Promise<ApiResponse<Cart>> {
    return api.get<ApiResponse<Cart>>('/cart');
  },

  async addItem(variantId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    return api.post<ApiResponse<CartItem>>('/cart/items', {variantId, quantity});
  },

  async updateItem(itemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    return api.patch<ApiResponse<CartItem>>(`/cart/items/${itemId}`, {quantity});
  },

  async removeItem(itemId: string): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`/cart/items/${itemId}`);
  },

  async applyDiscount(code: string): Promise<ApiResponse<Cart>> {
    return api.post<ApiResponse<Cart>>('/cart/apply-discount', {code});
  },
};
