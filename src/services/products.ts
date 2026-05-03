import {api} from './api';
import type {Product, ProductFilters, PaginationParams, ApiResponse} from '@/types';

export const productService = {
  async getProducts(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<Product[]>> {
    return api.get<ApiResponse<Product[]>>('/products', {
      params: {...filters, ...pagination},
    });
  },

  async getProduct(slug: string): Promise<ApiResponse<Product>> {
    return api.get<ApiResponse<Product>>(`/products/${slug}`);
  },

  async searchProducts(
    query: string
  ): Promise<ApiResponse<{id: string; name: string; slug: string}[]>> {
    return api.get<ApiResponse<{id: string; name: string; slug: string}[]>>('/products/search', {
      params: {q: query},
    });
  },
};
