import {supabaseAdmin} from '../lib/supabase';
import {logDiscountUse, logDiscountValidation} from '../lib/logger';

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
  min_order_amount: number;
  created_at: string;
  updated_at: string;
}

export interface DiscountValidationResult {
  valid: boolean;
  discount?: {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderAmount?: number;
  };
  discountAmount?: number;
  error?: string;
}

export async function findByCode(code: string): Promise<Discount | null> {
  const {data, error} = await supabaseAdmin
    .from('discounts')
    .select('*')
    .eq('code', code)
    .single();

  if (error || !data) return null;
  return data as Discount;
}

export async function create(
  discount: Omit<Discount, 'id' | 'uses_count' | 'created_at' | 'updated_at'>
): Promise<Discount> {
  const {data, error} = await supabaseAdmin.from('discounts').insert(discount).select().single();

  if (error || !data) throw new Error(`Failed to create discount: ${error?.message}`);
  return data as Discount;
}

export async function incrementUses(discountId: string, code?: string): Promise<void> {
  await supabaseAdmin.rpc('increment_discount_uses', {discount_id: discountId});
  logDiscountUse({
    discountId,
    code: code || 'unknown',
  });
}

export async function deactivate(discountId: string): Promise<void> {
  const {error} = await supabaseAdmin
    .from('discounts')
    .update({is_active: false, updated_at: new Date().toISOString()})
    .eq('id', discountId);

  if (error) throw new Error(`Failed to deactivate discount: ${error.message}`);
}

export function isExpired(discount: Discount): boolean {
  if (!discount.expires_at) return false;
  return new Date(discount.expires_at) < new Date();
}

export function isExhausted(discount: Discount): boolean {
  if (discount.max_uses === null) return false;
  return discount.uses_count >= discount.max_uses;
}

export async function validateDiscount(
  code: string,
  orderSubtotal: number
): Promise<DiscountValidationResult> {
  const discount = await findByCode(code);

  if (!discount) {
    logDiscountValidation({code, valid: false, reason: 'Invalid discount code'});
    return {valid: false, error: 'Invalid discount code'};
  }

  if (!discount.is_active) {
    logDiscountValidation({code, valid: false, reason: 'Discount not active', discountId: discount.id});
    return {valid: false, error: 'Discount code is no longer active'};
  }

  if (isExpired(discount)) {
    logDiscountValidation({code, valid: false, reason: 'Discount expired', discountId: discount.id});
    return {valid: false, error: 'Discount code has expired'};
  }

  if (discount.starts_at && new Date(discount.starts_at) > new Date()) {
    logDiscountValidation({code, valid: false, reason: 'Discount not yet active', discountId: discount.id});
    return {valid: false, error: 'Discount code is not yet active'};
  }

  if (isExhausted(discount)) {
    logDiscountValidation({code, valid: false, reason: 'Usage limit reached', discountId: discount.id});
    return {valid: false, error: 'Discount code usage limit reached'};
  }

  if (discount.min_order_amount && orderSubtotal < discount.min_order_amount) {
    logDiscountValidation({
      code,
      valid: false,
      reason: `Min order ${discount.min_order_amount}`,
      discountId: discount.id,
    });
    return {
      valid: false,
      error: `Minimum order amount of ${discount.min_order_amount} required for this discount`,
    };
  }

  return {
    valid: true,
    discount: {
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value: Number(discount.value),
      minOrderAmount: discount.min_order_amount ? Number(discount.min_order_amount) : undefined,
    },
  };
}

export function applyDiscount(
  discount: {type: 'percentage' | 'fixed'; value: number},
  subtotal: number
): {discount_amount: number} {
  let discountAmount = 0;

  if (discount.type === 'percentage') {
    discountAmount = subtotal * (Number(discount.value) / 100);
  } else {
    discountAmount = Number(discount.value);
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  return {discount_amount: discountAmount};
}

export default {
  findByCode,
  create,
  incrementUses,
  deactivate,
  isExpired,
  isExhausted,
  validateDiscount,
  applyDiscount,
};