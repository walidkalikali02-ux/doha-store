export const GA4_CONFIG = {
  measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID ?? 'G-XXXXXXXXXX',
  debugMode: import.meta.env.DEV,
};

export const CUSTOM_EVENTS = {
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  CHECKOUT_PROGRESS: 'checkout_progress',
  PURCHASE: 'purchase',
  VIEW_ITEM: 'view_item',
  VIEW_ITEM_LIST: 'view_item_list',
  SEARCH: 'search',
  SELECT_CONTENT: 'select_content',
  SHARE: 'share',
  LOGIN: 'login',
  SIGN_UP: 'sign_up',
  ERROR: 'error_event',
  CART_ABANDONED: 'cart_abandoned',
  PAYMENT_SELECTED: 'payment_selected',
  SHIPPING_SELECTED: 'shipping_selected',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  PRODUCT_REVIEW: 'product_review',
  WISHLIST_ADD: 'add_to_wishlist',
  COUPON_APPLIED: 'coupon_applied',
} as const;

export const EVENT_PARAMETERS = {
  CURRENCY: 'currency',
  VALUE: 'value',
  ITEMS: 'items',
  ITEM_ID: 'item_id',
  ITEM_NAME: 'item_name',
  ITEM_CATEGORY: 'item_category',
  ITEM_VARIANT: 'item_variant',
  PRICE: 'price',
  QUANTITY: 'quantity',
  TRANSACTION_ID: 'transaction_id',
  SHIPPING: 'shipping',
  TAX: 'tax',
  COUPON: 'coupon',
  PAYMENT_TYPE: 'payment_type',
  SHIPPING_TIER: 'shipping_tier',
  CHECKOUT_STEP: 'checkout_step',
  CHECKOUT_OPTION: 'checkout_option',
  ERROR_TYPE: 'error_type',
  ERROR_MESSAGE: 'error_message',
  PAGE_NAME: 'page_name',
  PAGE_CATEGORY: 'page_category',
  USER_ID: 'user_id',
} as const;

export const CHECKOUT_STEPS = {
  SHIPPING: 1,
  PAYMENT: 2,
  REVIEW: 3,
  CONFIRMATION: 4,
} as const;

export const EVENT_CATEGORIES = {
  ECOMMERCE: 'ecommerce',
  ENGAGEMENT: 'engagement',
  ERROR: 'error',
  USER_ACCOUNT: 'user_account',
  MARKETING: 'marketing',
} as const;

export const CONVERSION_EVENTS = {
  PURCHASE: 'purchase',
  SIGN_UP: 'sign_up',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_TO_CART: 'add_to_cart',
} as const;

export const CUSTOM_DIMENSIONS = {
  USER_TYPE: 'user_type',
  CUSTOMER_TIER: 'customer_tier',
  SUBSCRIPTION_STATUS: 'subscription_status',
  PREFERRED_LANGUAGE: 'preferred_language',
  DEVICE_TYPE: 'device_type',
  TRAFFIC_SOURCE: 'traffic_source',
} as const;

export const CUSTOM_METRICS = {
  TOTAL_ORDER_VALUE: 'total_order_value',
  PRODUCTS_VIEWED: 'products_viewed',
  TIME_TO_PURCHASE: 'time_to_purchase',
  CART_ABANDONMENT_RATE: 'cart_abandonment_rate',
} as const;

export const ITEM_SCHEMA = {
  ITEM_ID: 'item_id',
  ITEM_NAME: 'item_name',
  ITEM_BRAND: 'item_brand',
  ITEM_CATEGORY: 'item_category',
  ITEM_CATEGORY2: 'item_category2',
  ITEM_CATEGORY3: 'item_category3',
  ITEM_VARIANT: 'item_variant',
  PRICE: 'price',
  QUANTITY: 'quantity',
  COUPON: 'coupon',
  DISCOUNT: 'discount',
  INDEX: 'index',
  ITEM_LIST_ID: 'item_list_id',
  ITEM_LIST_NAME: 'item_list_name',
  LOCATION_ID: 'location_id',
} as const;

export type CustomEventName = (typeof CUSTOM_EVENTS)[keyof typeof CUSTOM_EVENTS];
export type EventParameter = (typeof EVENT_PARAMETERS)[keyof typeof EVENT_PARAMETERS];
export type CheckoutStepValue = (typeof CHECKOUT_STEPS)[keyof typeof CHECKOUT_STEPS];
export type EventCategory = (typeof EVENT_CATEGORIES)[keyof typeof EVENT_CATEGORIES];
