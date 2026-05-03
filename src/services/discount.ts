import {api} from './api';

export type DiscountType = 'percentage' | 'fixed' | 'shipping';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  appliesTo: 'all' | 'category' | 'product' | 'user';
  categoryIds?: string[];
  productIds?: string[];
  userIds?: string[];
  description: string;
  descriptionEn: string;
}

export interface ApplyDiscountRequest {
  code: string;
  cartTotal: number;
  items: Array<{
    productId: string;
    categoryId: string;
    quantity: number;
    price: number;
  }>;
}

export interface ApplyDiscountResponse {
  success: boolean;
  discount: {
    code: string;
    type: DiscountType;
    value: number;
    discountAmount: number;
    message?: string;
  };
  validation: {
    isValid: boolean;
    reason?: string;
  };
}

export interface ValidateDiscountRequest {
  code: string;
  cartTotal: number;
  items: Array<{
    productId: string;
    categoryId: string;
    quantity: number;
    price: number;
  }>;
}

export interface ValidateDiscountResponse {
  isValid: boolean;
  discount?: Discount;
  reason?: string;
  estimatedDiscount?: number;
}

export const discountService = {
  async getDiscounts(): Promise<{discounts: Discount[]}> {
    const response = await api.get<{discounts: Discount[]}>('/discounts');
    return response;
  },

  async getDiscountByCode(code: string): Promise<{discount: Discount}> {
    const response = await api.get<{discount: Discount}>(`/discounts/${code}`);
    return response;
  },

  async validateDiscount(data: ValidateDiscountRequest): Promise<ValidateDiscountResponse> {
    const response = await api.post<ValidateDiscountResponse>('/discounts/validate', data);
    return response;
  },

  async applyDiscount(data: ApplyDiscountRequest): Promise<ApplyDiscountResponse> {
    const response = await api.post<ApplyDiscountResponse>('/discounts/apply', data);
    return response;
  },

  async removeDiscount(): Promise<{success: boolean}> {
    const response = await api.delete<{success: boolean}>('/discounts/cart');
    return response;
  },

  async getAvailableDiscounts(cartTotal: number): Promise<{discounts: Discount[]}> {
    const response = await api.get<{discounts: Discount[]}>('/discounts/available', {
      params: {cartTotal},
    });
    return response;
  },

  async createDiscount(data: Omit<Discount, 'id' | 'usageCount'>): Promise<{discount: Discount}> {
    const response = await api.post<{discount: Discount}>('/admin/discounts', data);
    return response;
  },

  async updateDiscount(id: string, data: Partial<Discount>): Promise<{discount: Discount}> {
    const response = await api.patch<{discount: Discount}>(`/admin/discounts/${id}`, data);
    return response;
  },

  async deleteDiscount(id: string): Promise<{success: boolean}> {
    const response = await api.delete<{success: boolean}>(`/admin/discounts/${id}`);
    return response;
  },

  async getDiscountUsageStats(id: string): Promise<{
    totalUses: number;
    uniqueUsers: number;
    revenue: number;
    savings: number;
  }> {
    const response = await api.get<{
      totalUses: number;
      uniqueUsers: number;
      revenue: number;
      savings: number;
    }>(`/admin/discounts/${id}/stats`);
    return response;
  },
};

export const DISCOUNT_RULES = {
  PERCENTAGE_MAX: 100,
  PERCENTAGE_MIN: 0,
  FIXED_MIN: 0,
  CODE_MIN_LENGTH: 3,
  CODE_MAX_LENGTH: 20,
  MIN_ORDER_DEFAULT: 0,
  USAGE_UNLIMITED: -1,
};

export function calculateDiscount(
  discount: Discount,
  cartTotal: number,
  shippingCost: number = 0
): number {
  if (cartTotal < discount.minimumOrderAmount) {
    return 0;
  }

  let discountAmount = 0;

  switch (discount.type) {
    case 'percentage':
      discountAmount = (cartTotal * discount.value) / 100;
      if (discount.maximumDiscount) {
        discountAmount = Math.min(discountAmount, discount.maximumDiscount);
      }
      break;
    case 'fixed':
      discountAmount = Math.min(discount.value, cartTotal);
      break;
    case 'shipping':
      discountAmount = shippingCost;
      break;
  }

  return Math.round(discountAmount);
}

export function formatDiscountValue(discount: Discount): string {
  switch (discount.type) {
    case 'percentage':
      return `${discount.value}%`;
    case 'fixed':
      return `${(discount.value / 1000).toFixed(3)} د.ك`;
    case 'shipping':
      return 'شحن مجاني';
    default:
      return '';
  }
}

export function isDiscountValid(discount: Discount): boolean {
  const now = new Date();
  const startDate = new Date(discount.startDate);
  const endDate = new Date(discount.endDate);

  if (!discount.isActive) return false;
  if (now < startDate) return false;
  if (now > endDate) return false;
  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return false;

  return true;
}

export function getDiscountStatus(
  discount: Discount
): 'active' | 'expired' | 'upcoming' | 'exhausted' {
  const now = new Date();
  const startDate = new Date(discount.startDate);
  const endDate = new Date(discount.endDate);

  if (!discount.isActive) return 'expired';
  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return 'exhausted';
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'expired';
  return 'active';
}
