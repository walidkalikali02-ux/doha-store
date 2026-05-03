# Analytics Documentation

## Overview

This document covers all analytics events tracked in the Doha Roastery e-commerce application.

---

## Event Categories

### 1. E-Commerce Events

Events related to product browsing, cart management, and checkout.

#### `view_item` - Product View

Fired when a user views a product detail page.

```typescript
analytics.trackViewItem({
  productId: 'prod_123',
  productName: 'Ethiopian Yirgacheffe',
  category: 'single_origin',
  price: 2200, // in fils
});
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | string | Yes | Unique product identifier |
| `productName` | string | Yes | Product name |
| `category` | string | No | Product category |
| `price` | number | Yes | Product price in fils |

---

#### `view_item_list` - Product List View

Fired when a user views a product listing page.

```typescript
analytics.trackEvent({
  eventName: 'view_item_list',
  eventCategory: 'ecommerce',
  eventLabel: 'Search Results',
  additionalData: {
    item_list_id: 'search_results',
    item_list_name: 'Search Results',
    items: [
      {item_id: 'prod_123', item_name: 'Product 1', price: 2200},
      {item_id: 'prod_456', item_name: 'Product 2', price: 1800},
    ],
  },
});
```

---

#### `add_to_cart` - Add to Cart

Fired when a user adds a product to their cart.

```typescript
analytics.trackAddToCart({
  productId: 'prod_123',
  productName: 'Ethiopian Yirgacheffe',
  category: 'single_origin',
  price: 2200,
  quantity: 2,
});
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | string | Yes | Unique product identifier |
| `productName` | string | Yes | Product name |
| `category` | string | No | Product category |
| `price` | number | Yes | Unit price in fils |
| `quantity` | number | Yes | Quantity added |

---

#### `remove_from_cart` - Remove from Cart

Fired when a user removes a product from their cart.

```typescript
analytics.trackRemoveFromCart({
  productId: 'prod_123',
  productName: 'Ethiopian Yirgacheffe',
  quantity: 1,
});
```

---

#### `begin_checkout` - Checkout Started

Fired when a user initiates the checkout process.

```typescript
analytics.trackCheckoutStart({
  totalAmount: 5000,
  itemCount: 3,
  currency: 'KWD',
  products: [
    {id: 'prod_123', name: 'Product 1', price: 2200, quantity: 2},
    {id: 'prod_456', name: 'Product 2', price: 1800, quantity: 1},
  ],
});
```

---

#### `checkout_step` - Checkout Progress

Fired at each step of the checkout funnel.

```typescript
// Step 1: Shipping
analytics.trackCheckoutStep(1, {
  shippingMethod: 'express',
  totalAmount: 5000,
  itemCount: 3,
});

// Step 2: Payment
analytics.trackCheckoutStep(2, {
  paymentMethod: 'card',
  totalAmount: 5000,
  itemCount: 3,
});

// Step 3: Review
analytics.trackCheckoutStep(3, {
  totalAmount: 5000,
  itemCount: 3,
});

// Step 4: Confirmation
analytics.trackCheckoutStep(4, {
  orderId: 'ORD-123456',
  totalAmount: 5000,
  itemCount: 3,
});
```

**Checkout Steps:**
| Step | Name | Description |
|------|------|-------------|
| 1 | Shipping | Shipping information entered |
| 2 | Payment | Payment method selected |
| 3 | Review | Order review completed |
| 4 | Confirmation | Order placed successfully |

---

#### `purchase` - Order Completed

Fired when an order is successfully completed.

```typescript
analytics.trackPurchase({
  orderId: 'ORD-123456',
  revenue: 5000,
  tax: 400,
  shipping: 0,
  currency: 'KWD',
  paymentMethod: 'card',
  shippingMethod: 'express',
  items: [
    {id: 'prod_123', name: 'Product 1', price: 2200, quantity: 2},
    {id: 'prod_456', name: 'Product 2', price: 1800, quantity: 1},
  ],
});
```

---

### 2. Cart Events

#### `cart_view` - Cart Page Viewed

Fired when the cart page is viewed.

```typescript
analytics.trackPageView({
  pageName: 'cart',
  pageCategory: 'ecommerce',
  additionalData: {
    cart_value: 5000,
    cart_items: 3,
    items: [...],
  },
});
```

---

#### `cart_abandoned` - Cart Abandoned

Fired when a user leaves the cart without completing checkout.

```typescript
analytics.trackEvent({
  eventName: 'cart_abandoned',
  eventCategory: 'cart',
  eventLabel: 'Cart Abandonment',
  eventValue: 5000,
  additionalData: {
    cart_value: 5000,
    cart_items: 3,
    abandonment_page: '/cart',
    items: [...],
  },
});
```

---

#### `shipping_selected` - Shipping Method Selected

Fired when a user selects a shipping method.

```typescript
analytics.trackShippingSelected('express', 1250);
```

---

#### `payment_selected` - Payment Method Selected

Fired when a user selects a payment method.

```typescript
analytics.trackPaymentSelected('card');
```

---

### 3. Search Events

#### `search` - Search Performed

Fired when a user performs a search.

```typescript
analytics.trackSearch('ethiopian coffee', 25);
```

---

### 4. User Events

#### `sign_up` - User Registration

Fired when a user creates an account.

```typescript
analytics.trackEvent({
  eventName: 'sign_up',
  eventCategory: 'user_account',
  eventLabel: 'Email Registration',
  additionalData: {
    method: 'email',
  },
});
```

---

#### `login` - User Login

Fired when a user logs in.

```typescript
analytics.trackEvent({
  eventName: 'login',
  eventCategory: 'user_account',
  eventLabel: 'Email Login',
  additionalData: {
    method: 'email',
  },
});
```

---

#### `set_user_id` - User Identification

Sets the user ID for cross-session tracking.

```typescript
analytics.setUserId('user_12345');
```

---

### 5. Error Events

#### `error_event` - Error Occurred

Fired when an error occurs during checkout or other flows.

```typescript
analytics.trackError({
  errorType: 'payment_error',
  errorMessage: 'Card declined',
  errorCode: 'PAYMENT_DECLINED',
  step: 2, // Payment step
  additionalData: {
    paymentMethod: 'card',
    amount: 5000,
  },
});
```

---

### 6. Subscription Events

#### `subscription_created` - New Subscription

Fired when a user subscribes to a coffee subscription.

```typescript
analytics.trackEvent({
  eventName: 'subscription_created',
  eventCategory: 'subscription',
  additionalData: {
    subscription_id: 'sub_123',
    frequency: 'monthly',
    products: [...],
    total_value: 2200,
  },
});
```

---

#### `subscription_paused` - Subscription Paused

Fired when a user pauses their subscription.

```typescript
analytics.trackEvent({
  eventName: 'subscription_paused',
  eventCategory: 'subscription',
  additionalData: {
    subscription_id: 'sub_123',
    pause_duration: '1_month',
  },
});
```

---

#### `subscription_cancelled` - Subscription Cancelled

Fired when a user cancels their subscription.

```typescript
analytics.trackEvent({
  eventName: 'subscription_cancelled',
  eventCategory: 'subscription',
  additionalData: {
    subscription_id: 'sub_123',
    cancellation_reason: 'too_expensive',
    subscription_age_days: 90,
  },
});
```

---

### 7. Loyalty Events

#### `loyalty_points_earned` - Points Earned

Fired when a user earns loyalty points.

```typescript
analytics.trackEvent({
  eventName: 'loyalty_points_earned',
  eventCategory: 'loyalty',
  additionalData: {
    points_earned: 50,
    source: 'purchase',
    order_id: 'ORD-123',
    total_points: 500,
  },
});
```

---

#### `loyalty_points_redeemed` - Points Redeemed

Fired when a user redeems loyalty points.

```typescript
analytics.trackEvent({
  eventName: 'loyalty_points_redeemed',
  eventCategory: 'loyalty',
  additionalData: {
    points_redeemed: 100,
    discount_value: 500,
    order_id: 'ORD-123',
    remaining_points: 400,
  },
});
```

---

### 8. Marketing Events

#### `newsletter_signup` - Newsletter Subscription

Fired when a user subscribes to the newsletter.

```typescript
analytics.trackEvent({
  eventName: 'newsletter_signup',
  eventCategory: 'marketing',
  eventLabel: 'Footer Newsletter Form',
  additionalData: {
    source: 'footer',
    user_type: 'guest',
  },
});
```

---

## Funnel Tracking

### Checkout Funnel

```typescript
import {trackCheckoutFunnel} from '@/lib/funnelTracker';

// Start funnel when cart is viewed
trackCheckoutFunnel.start({cart_value: 5000, item_count: 3});

// Track each step
trackCheckoutFunnel.viewCart({cart_value: 5000});
trackCheckoutFunnel.beginCheckout({cart_value: 5000, item_count: 3});
trackCheckoutFunnel.completeShipping({shipping_method: 'express', shipping_cost: 1250});
trackCheckoutFunnel.completePayment({payment_method: 'card'});
trackCheckoutFunnel.completeReview({cart_value: 6250});

// Complete funnel on purchase
trackCheckoutFunnel.complete({
  order_id: 'ORD-123',
  value: 6250,
  currency: 'KWD',
});

// Track drop-off if user abandons
trackCheckoutFunnel.drop('payment_failed', {error_code: 'CARD_DECLINED'});
```

### Product Discovery Funnel

```typescript
import {trackProductDiscovery} from '@/lib/funnelTracker';

trackProductDiscovery.start();
trackProductDiscovery.viewHomepage();
trackProductDiscovery.viewProductList({category: 'single_origin'});
trackProductDiscovery.viewProduct({product_id: 'prod_123', product_name: 'Ethiopian Yirgacheffe'});
trackProductDiscovery.addToCart({product_id: 'prod_123', quantity: 2});
trackProductDiscovery.complete();
```

---

## GA4 Setup Instructions

### 1. Create Custom Events in GA4

1. Go to **Admin > Events > Create event**
2. Create the following custom events:

| Event Name          | Description                              |
| ------------------- | ---------------------------------------- |
| `add_to_cart`       | Triggered when product added to cart     |
| `remove_from_cart`  | Triggered when product removed from cart |
| `begin_checkout`    | Triggered when checkout initiated        |
| `purchase`          | Triggered when order completed           |
| `shipping_selected` | Triggered when shipping method chosen    |
| `payment_selected`  | Triggered when payment method chosen     |
| `cart_abandoned`    | Triggered when cart abandoned            |
| `checkout_step`     | Triggered at each checkout step          |
| `error_event`       | Triggered when error occurs              |

### 2. Create Conversions

Mark the following events as conversions:

- `purchase`
- `sign_up`
- `newsletter_signup`

### 3. Create Custom Dimensions

| Dimension Name      | Scope | Parameter             |
| ------------------- | ----- | --------------------- |
| User Type           | User  | `user_type`           |
| Customer Tier       | User  | `customer_tier`       |
| Subscription Status | User  | `subscription_status` |
| Preferred Language  | User  | `preferred_language`  |

### 4. Create Custom Metrics

| Metric Name       | Scope | Unit     |
| ----------------- | ----- | -------- |
| Total Order Value | Event | Currency |
| Products Viewed   | Event | Count    |
| Time to Purchase  | Event | Seconds  |

---

## Funnels in GA4

### Checkout Funnel

1. Go to **Explore > Funnel exploration**
2. Create funnel with steps:
   - Step 1: `view_item_list`
   - Step 2: `view_item`
   - Step 3: `add_to_cart`
   - Step 4: `begin_checkout`
   - Step 5: `add_shipping_info`
   - Step 6: `add_payment_info`
   - Step 7: `purchase`

### Registration Funnel

1. Step 1: `page_view` (registration page)
2. Step 2: `sign_up` (started)
3. Step 3: `sign_up` (completed)

---

## Reports Configuration

### E-Commerce Overview Report

```typescript
import {analyticsReporter} from '@/lib/analyticsReporter';

const report = analyticsReporter.generateReport('ecommerce_overview');
```

### Available Reports

| Report Name             | Description                    |
| ----------------------- | ------------------------------ |
| `ecommerce_overview`    | Overall e-commerce performance |
| `checkout_funnel`       | Checkout funnel analysis       |
| `product_performance`   | Product performance metrics    |
| `user_behavior`         | User behavior analysis         |
| `marketing_attribution` | Marketing channel attribution  |

---

## Implementation Examples

### Product Page

```typescript
import {analytics} from '@/lib/analytics';

function ProductPage({product}) {
  useEffect(() => {
    analytics.trackPageView({
      pageName: `product_${product.id}`,
      pageCategory: 'product',
    });
    analytics.trackViewItem({
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
    });
  }, [product]);

  const handleAddToCart = () => {
    analytics.trackAddToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
    });
  };
}
```

### Checkout Page

```typescript
import {trackCheckoutFunnel} from '@/lib/funnelTracker';

function CheckoutPage() {
  useEffect(() => {
    trackCheckoutFunnel.start({cart_value: cart.total, item_count: cart.items.length});
  }, []);

  const handleShippingComplete = () => {
    trackCheckoutFunnel.completeShipping({
      shipping_method: selectedMethod,
      shipping_cost: shippingCost,
    });
  };
}
```

---

## Debug Mode

Enable debug mode in development:

```env
VITE_ENABLE_ANALYTICS=true
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Events will be logged to console in development mode.

---

## Best Practices

1. **Consistent Naming**: Use snake_case for event names and parameters
2. **Required Parameters**: Always include required parameters for each event
3. **Meaningful Values**: Use actual values, not placeholders
4. **Currency**: All monetary values should be in fils (KWD \* 1000)
5. **Timing**: Track events at the point of action, not on page load
6. **User ID**: Set user ID after login for cross-device tracking
7. **Error Tracking**: Include error codes and messages for debugging

---

## Event Reference Quick Guide

| Event               | Category     | When to Track             |
| ------------------- | ------------ | ------------------------- |
| `view_item`         | E-commerce   | Product page load         |
| `view_item_list`    | E-commerce   | Category/search page load |
| `add_to_cart`       | E-commerce   | Product added to cart     |
| `remove_from_cart`  | E-commerce   | Product removed from cart |
| `begin_checkout`    | E-commerce   | Checkout started          |
| `checkout_step`     | E-commerce   | Each checkout step        |
| `purchase`          | E-commerce   | Order completed           |
| `sign_up`           | User         | Account created           |
| `login`             | User         | User logged in            |
| `search`            | Engagement   | Search performed          |
| `error_event`       | Error        | Error occurred            |
| `page_view`         | Navigation   | Page load                 |
| `newsletter_signup` | Marketing    | Newsletter subscribed     |
| `subscription_*`    | Subscription | Subscription events       |
| `loyalty_*`         | Loyalty      | Points events             |
