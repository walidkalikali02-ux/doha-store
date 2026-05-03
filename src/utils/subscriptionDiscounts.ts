import type {SubscriptionFrequency} from '@/services/subscriptions';

export interface DiscountTier {
  frequency: SubscriptionFrequency;
  discountPercent: number;
  nameAr: string;
  nameEn: string;
}

export interface SubscriptionDiscountResult {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  savingsOverTime: SavingsOverTime;
}

export interface SavingsOverTime {
  weekly: number;
  monthly: number;
  yearly: number;
}

export const DISCOUNT_TIERS: DiscountTier[] = [
  {
    frequency: 'weekly',
    discountPercent: 15,
    nameAr: 'أسبوعي',
    nameEn: 'Weekly',
  },
  {
    frequency: 'bi_weekly',
    discountPercent: 12,
    nameAr: 'كل أسبوعين',
    nameEn: 'Bi-Weekly',
  },
  {
    frequency: 'monthly',
    discountPercent: 10,
    nameAr: 'شهري',
    nameEn: 'Monthly',
  },
];

export const MINIMUM_ORDER_AMOUNT = 15;
export const MAXIMUM_SUBSCRIPTION_ITEMS = 10;

export function calculateSubscriptionPrice(
  basePrice: number,
  frequency: SubscriptionFrequency
): SubscriptionDiscountResult {
  const tier = DISCOUNT_TIERS.find(t => t.frequency === frequency) ?? DISCOUNT_TIERS[2];
  if (!tier) {
    throw new Error('No discount tier found');
  }
  const discountPercent = tier.discountPercent;
  const discountAmount = basePrice * (discountPercent / 100);
  const finalPrice = basePrice - discountAmount;

  const deliveriesPerYear = getDeliveriesPerYear(frequency);
  const savingsOverTime: SavingsOverTime = {
    weekly: discountAmount * deliveriesPerYear.weekly,
    monthly: discountAmount * deliveriesPerYear.monthly,
    yearly: discountAmount * deliveriesPerYear.yearly,
  };

  return {
    originalPrice: basePrice,
    discountPercent,
    discountAmount,
    finalPrice,
    savingsOverTime,
  };
}

function getDeliveriesPerYear(frequency: SubscriptionFrequency): {
  weekly: number;
  monthly: number;
  yearly: number;
} {
  const deliveriesPerYear: Record<SubscriptionFrequency, number> = {
    weekly: 52,
    bi_weekly: 26,
    monthly: 12,
  };

  const deliveries = deliveriesPerYear[frequency] ?? 12;

  return {
    weekly: 1,
    monthly: deliveries,
    yearly: deliveries,
  };
}

export function calculateTotalSubscriptionValue(
  items: Array<{price: number; quantity: number; frequency: SubscriptionFrequency}>
): {
  totalOriginalPrice: number;
  totalDiscountAmount: number;
  totalFinalPrice: number;
  averageDiscountPercent: number;
} {
  let totalOriginalPrice = 0;
  let totalDiscountAmount = 0;
  let totalFinalPrice = 0;
  let totalWeightedDiscount = 0;

  for (const item of items) {
    const {originalPrice, discountAmount, finalPrice, discountPercent} = calculateSubscriptionPrice(
      item.price,
      item.frequency
    );

    const itemTotalPrice = originalPrice * item.quantity;
    const itemDiscountAmount = discountAmount * item.quantity;
    const itemFinalPrice = finalPrice * item.quantity;

    totalOriginalPrice += itemTotalPrice;
    totalDiscountAmount += itemDiscountAmount;
    totalFinalPrice += itemFinalPrice;
    totalWeightedDiscount += discountPercent * itemTotalPrice;
  }

  const averageDiscountPercent =
    totalOriginalPrice > 0 ? totalWeightedDiscount / totalOriginalPrice : 0;

  return {
    totalOriginalPrice,
    totalDiscountAmount,
    totalFinalPrice,
    averageDiscountPercent,
  };
}

export function getRecommendedFrequency(totalQuantity: number): SubscriptionFrequency {
  if (totalQuantity >= 3) {
    return 'weekly';
  } else if (totalQuantity >= 2) {
    return 'bi_weekly';
  }
  return 'monthly';
}

export function formatDiscountPercent(percent: number): string {
  return `${Math.round(percent)}%`;
}

export function formatSavings(amount: number, currency: string = 'QAR'): string {
  return `${amount.toFixed(3)} ${currency}`;
}

export function canApplySubscriptionDiscount(
  items: Array<{price: number; quantity: number}>
): boolean {
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return totalAmount >= MINIMUM_ORDER_AMOUNT;
}

export function validateSubscriptionItems(
  items: Array<{productId: string; variantId: string; quantity: number}>
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (items.length === 0) {
    errors.push('يجب إضافة منتج واحد على الأقل للاشتراك');
  }

  if (items.length > MAXIMUM_SUBSCRIPTION_ITEMS) {
    errors.push(`الحد الأقصى للمنتجات في الاشتراك هو ${MAXIMUM_SUBSCRIPTION_ITEMS}`);
  }

  for (const item of items) {
    if (item.quantity < 1) {
      errors.push('كمية المنتج يجب أن تكون 1 على الأقل');
    }
    if (item.quantity > 5) {
      errors.push('الكمية القصوى للمنتج الواحد هي 5');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getSubscriptionSavingsMessage(
  frequency: SubscriptionFrequency,
  yearlySavings: number,
  currency: string = 'QAR'
): string {
  const tier = DISCOUNT_TIERS.find(t => t.frequency === frequency);
  if (!tier) return '';

  const savingsStr = formatSavings(yearlySavings, currency);

  switch (frequency) {
    case 'weekly':
      return `اشترك أسبوعياً ووفّر ${savingsStr} سنوياً!`;
    case 'bi_weekly':
      return `اشترك كل أسبوعين ووفّر ${savingsStr} سنوياً!`;
    case 'monthly':
      return `اشترك شهرياً ووفّر ${savingsStr} سنوياً!`;
    default:
      return `وفّر ${savingsStr} سنوياً مع الاشتراك!`;
  }
}
