import type {
  UserRole,
  OrderStatus,
  ProductType,
  ProductStatus,
  RoastLevel,
  ProcessingMethod,
  SizeOption,
  GrindOption,
  ShippingMethod,
  SubscriptionFrequency,
  SubscriptionStatus,
  PaymentMethod,
  LoyaltyTier,
  ReviewStatus,
} from '@/types';

// ============================================
// User Constants
// ============================================

export const USER_ROLES: UserRole[] = ['guest', 'customer', 'wholesale', 'admin', 'super_admin'];

export const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'Guest',
  customer: 'Customer',
  wholesale: 'Wholesale',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

// ============================================
// Product Constants
// ============================================

export const PRODUCT_TYPES: ProductType[] = [
  'coffee',
  'equipment',
  'accessories',
  'merchandise',
  'gift',
];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  coffee: 'Coffee Beans',
  equipment: 'Equipment',
  accessories: 'Accessories',
  merchandise: 'Merchandise',
  gift: 'Gift Sets',
};

export const PRODUCT_STATUSES: ProductStatus[] = ['draft', 'published', 'archived'];

export const ROAST_LEVELS: RoastLevel[] = ['light', 'medium', 'medium-dark', 'dark'];

export const ROAST_LEVEL_LABELS: Record<RoastLevel, string> = {
  light: 'Light Roast',
  medium: 'Medium Roast',
  'medium-dark': 'Medium-Dark Roast',
  dark: 'Dark Roast',
};

export const PROCESSING_METHODS: ProcessingMethod[] = ['washed', 'natural', 'honey'];

export const PROCESSING_METHOD_LABELS: Record<ProcessingMethod, string> = {
  washed: 'Washed',
  natural: 'Natural',
  honey: 'Honey',
};

export const SIZE_OPTIONS: SizeOption[] = ['250g', '500g', '1kg', '5kg'];

export const SIZE_LABELS: Record<SizeOption, string> = {
  '250g': '250g',
  '500g': '500g',
  '1kg': '1kg',
  '5kg': '5kg',
};

export const GRIND_OPTIONS: GrindOption[] = [
  'whole_bean',
  'espresso',
  'filter',
  'french_press',
  'pour_over',
  'turkish',
  'cold_brew',
];

export const GRIND_LABELS: Record<GrindOption, string> = {
  whole_bean: 'Whole Bean',
  espresso: 'Espresso',
  filter: 'Filter',
  french_press: 'French Press',
  pour_over: 'Pour Over',
  turkish: 'Turkish',
  cold_brew: 'Cold Brew',
};

// ============================================
// Order Constants
// ============================================

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'roasting',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  roasting: 'Roasting',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'yellow',
  processing: 'blue',
  roasting: 'orange',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'gray',
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  'standard',
  'express',
  'overnight',
  'local_pickup',
];

export const SHIPPING_METHOD_LABELS: Record<
  ShippingMethod,
  {name: string; description: string; days: string}
> = {
  standard: {name: 'Standard Shipping', description: '5-7 business days', days: '5-7'},
  express: {name: 'Express Shipping', description: '2-3 business days', days: '2-3'},
  overnight: {name: 'Overnight Shipping', description: 'Next business day', days: '1'},
  local_pickup: {name: 'Local Pickup', description: 'Pick up at roastery', days: 'Same day'},
};

// ============================================
// Subscription Constants
// ============================================

export const SUBSCRIPTION_FREQUENCIES: SubscriptionFrequency[] = ['weekly', 'bi_weekly', 'monthly'];

export const SUBSCRIPTION_FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  weekly: 'Weekly',
  bi_weekly: 'Bi-Weekly',
  monthly: 'Monthly',
};

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  'active',
  'paused',
  'cancelled',
  'past_due',
];

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  cancelled: 'Cancelled',
  past_due: 'Past Due',
};

export const DEFAULT_SUBSCRIPTION_DISCOUNT = 10; // 10%

// ============================================
// Payment Constants
// ============================================

export const PAYMENT_METHODS: PaymentMethod[] = [
  'stripe',
  'paypal',
  'apple_pay',
  'google_pay',
  'gift_card',
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: 'Credit Card',
  paypal: 'PayPal',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  gift_card: 'Gift Card',
};

// ============================================
// Loyalty Constants
// ============================================

export const LOYALTY_TIERS: LoyaltyTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export const LOYALTY_TIER_LABELS: Record<LoyaltyTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

export const LOYALTY_TIER_THRESHOLDS: Record<LoyaltyTier, number> = {
  bronze: 0,
  silver: 50000, // $500
  gold: 100000, // $1,000
  platinum: 250000, // $2,500
};

export const POINTS_PER_DOLLAR = 1;
export const POINTS_REDEMPTION_RATE = 100; // 100 points = $1
export const MINIMUM_REDEMPTION_POINTS = 500;
export const POINTS_EXPIRATION_DAYS = 365;

export const BONUS_POINTS = {
  ACCOUNT_CREATION: 100,
  REVIEW: 50,
  SOCIAL_SHARE: 25,
  BIRTHDAY: 200,
  REFERRAL: 500,
};

// ============================================
// Review Constants
// ============================================

export const REVIEW_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected'];

export const REVIEW_MIN_LENGTH = 50;
export const REVIEW_MAX_IMAGES = 5;
export const REVIEW_REQUEST_DAYS_AFTER_DELIVERY = 7;

// ============================================
// Cart Constants
// ============================================

export const CART_EXPIRATION_DAYS = 30;
export const CART_RESERVATION_MINUTES = 30;
export const MAX_CART_QUANTITY = 99;

// ============================================
// Inventory Constants
// ============================================

export const LOW_STOCK_THRESHOLD = 10;

// ============================================
// Data Retention
// ============================================

export const ACCOUNT_DELETION_RETENTION_DAYS = 90;

// ============================================
// Validation Constants
// ============================================

export const PASSWORD_MIN_LENGTH = 8;
export const MAX_LOGIN_ATTEMPTS = 5;
export const SESSION_TIMEOUT_MINUTES = 60;
export const REMEMBER_ME_DAYS = 30;
export const PASSWORD_RESET_EXPIRY_HOURS = 24;

// ============================================
// Pagination
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ============================================
// Currency
// ============================================

export const CURRENCY_CODE = 'QAR';
export const CURRENCY_SYMBOL = 'QAR';
