export interface Discount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  startsAt?: Date;
  expiresAt?: Date;
  active: boolean;
}

export function createDiscount(data: Partial<Discount>): Discount {
  return {
    code: data.code || '',
    type: data.type || 'percentage',
    value: data.value || 0,
    minOrderAmount: data.minOrderAmount,
    maxUses: data.maxUses,
    usedCount: data.usedCount || 0,
    startsAt: data.startsAt,
    expiresAt: data.expiresAt,
    active: data.active ?? true,
  };
}

export function isValidDiscount(discount: Discount, orderTotal: number): boolean {
  if (!discount.active) return false;
  if (discount.minOrderAmount && orderTotal < discount.minOrderAmount) return false;
  if (discount.maxUses && discount.usedCount >= discount.maxUses) return false;
  if (discount.expiresAt && new Date() > discount.expiresAt) return false;
  if (discount.startsAt && new Date() < discount.startsAt) return false;
  return true;
}

export default { createDiscount, isValidDiscount };