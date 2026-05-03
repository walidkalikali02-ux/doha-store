# API Contracts: Roastery E-Commerce Platform

**Date**: 2025-01-07  
**Feature**: Roastery E-Commerce Platform  
**Spec**: [spec.md](../spec.md) | **Data Model**: [../data-model.md](../data-model.md)

---

## Overview

This document defines the REST API contracts for the roastery e-commerce platform. All endpoints return JSON and follow RESTful conventions.

**Base URL**: `/api/v1`

**Authentication**: JWT Bearer token in `Authorization` header

**Standard Response Format**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

---

## Authentication

### POST /auth/register

Register a new user account.

**Request**:
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1-555-0123"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "customer@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "customer",
      "email_verified": false
    },
    "message": "Verification email sent"
  }
}
```

**Errors**:
- `409 Conflict`: Email already registered
- `400 Bad Request`: Invalid password format

---

### POST /auth/login

Authenticate and receive tokens.

**Request**:
```json
{
  "email": "customer@example.com",
  "password": "SecurePass123",
  "remember_me": true
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "email": "customer@example.com",
      "first_name": "John",
      "role": "customer"
    }
  }
}
```

**Note**: Refresh token is set as HTTP-only cookie.

---

### POST /auth/logout

Invalidate current session.

**Response (200)**:
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

### POST /auth/forgot-password

Request password reset email.

**Request**:
```json
{
  "email": "customer@example.com"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": { "message": "Password reset email sent" }
}
```

---

### POST /auth/reset-password

Reset password with token.

**Request**:
```json
{
  "token": "reset-token-from-email",
  "new_password": "NewSecurePass123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": { "message": "Password reset successfully" }
}
```

---

### POST /auth/social/:provider

Social login (google, facebook, apple).

**Request**:
```json
{
  "access_token": "oauth-access-token-from-provider"
}
```

**Response (200)**: Same as login response

---

## Products

### GET /products

List products with filtering.

**Query Parameters**:
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 20, max: 100)
- `type` (string): coffee/equipment/accessories/merchandise/gift
- `category` (string): Category slug
- `origin` (string): Origin country/region
- `roast_level` (string): light/medium/medium-dark/dark
- `flavor_notes` (array): Flavor tags
- `price_min` (int): Minimum price in cents
- `price_max` (int): Maximum price in cents
- `sort` (string): price_asc/price_desc/newest/best_selling/rating
- `search` (string): Search query

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Ethiopia Yirgacheffe",
        "slug": "ethiopia-yirgacheffe",
        "sku": "COF-ETH-001",
        "base_price": 1800,
        "type": "coffee",
        "origin_country": "Ethiopia",
        "roast_level": "light",
        "flavor_notes": ["citrus", "floral", "tea-like"],
        "images": [
          {
            "id": "uuid",
            "url": "https://cdn.example.com/products/eth-001-lg.jpg",
            "alt": "Ethiopia Yirgacheffe coffee bag",
            "position": 1
          }
        ],
        "variants": [
          {
            "id": "uuid",
            "sku": "COF-ETH-001-500-WB",
            "size": "500g",
            "grind": "whole_bean",
            "price_adjustment": 0,
            "available_quantity": 42,
            "is_available": true
          }
        ],
        "average_rating": 4.5,
        "review_count": 128,
        "badges": ["single_origin", "organic"]
      }
    ]
  },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

---

### GET /products/:slug

Get single product details.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ethiopia Yirgacheffe",
    "slug": "ethiopia-yirgacheffe",
    "sku": "COF-ETH-001",
    "description_short": "Bright, floral coffee from Ethiopia's Yirgacheffe region",
    "description_long": "Full description...",
    "base_price": 1800,
    "type": "coffee",
    "origin_country": "Ethiopia",
    "origin_region": "Yirgacheffe",
    "farm": "Gedeo Zone Cooperative",
    "roast_level": "light",
    "processing_method": "washed",
    "altitude_m": 1950,
    "flavor_notes": ["citrus", "floral", "tea-like", "bergamot"],
    "brewing_recommendations": "Best brewed as pour over or Chemex...",
    "images": [...],
    "variants": [...],
    "categories": [...],
    "tags": [...],
    "reviews_summary": {
      "average_rating": 4.5,
      "total_reviews": 128,
      "distribution": {
        "5": 89,
        "4": 28,
        "3": 8,
        "2": 2,
        "1": 1
      }
    },
    "related_products": [...]
  }
}
```

---

### GET /products/search

Autocomplete search.

**Query Parameters**:
- `q` (string): Search query (min 2 chars)
- `limit` (int): Max results (default: 10)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      { "type": "product", "name": "Ethiopia Yirgacheffe", "slug": "ethiopia-yirgacheffe" },
      { "type": "category", "name": "Single Origin", "slug": "single-origin" }
    ]
  }
}
```

---

## Cart

### GET /cart

Get current cart (guest or authenticated).

**Headers**:
- `X-Session-ID`: Required for guest carts

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "items": [
      {
        "id": "uuid",
        "variant_id": "uuid",
        "product": {
          "name": "Ethiopia Yirgacheffe",
          "image": "https://cdn.example.com/products/eth-001-sm.jpg"
        },
        "variant": {
          "size": "500g",
          "grind": "whole_bean",
          "sku": "COF-ETH-001-500-WB"
        },
        "quantity": 2,
        "unit_price": 1800,
        "total_price": 3600,
        "reservation_expires_at": "2025-01-07T16:30:00Z"
      }
    ],
    "summary": {
      "item_count": 2,
      "subtotal": 3600,
      "estimated_shipping": 0,
      "estimated_tax": 0,
      "total": 3600
    },
    "expires_at": "2025-02-06T10:00:00Z"
  }
}
```

---

### POST /cart/items

Add item to cart.

**Request**:
```json
{
  "variant_id": "uuid",
  "quantity": 2
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "item": { ... },
    "cart_summary": { ... },
    "message": "Item added to cart"
  }
}
```

**Errors**:
- `400 Bad Request`: Insufficient inventory
- `404 Not Found`: Variant not found

---

### PATCH /cart/items/:id

Update item quantity.

**Request**:
```json
{
  "quantity": 3
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "item": { ... },
    "cart_summary": { ... }
  }
}
```

---

### DELETE /cart/items/:id

Remove item from cart.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "cart_summary": { ... },
    "message": "Item removed"
  }
}
```

---

### POST /cart/apply-discount

Apply discount code.

**Request**:
```json
{
  "code": "SUMMER20"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "discount": {
      "code": "SUMMER20",
      "type": "percentage",
      "value": 20,
      "amount": 720
    },
    "cart_summary": {
      "subtotal": 3600,
      "discount": 720,
      "shipping": 0,
      "tax": 230,
      "total": 3110
    }
  }
}
```

---

## Checkout

### GET /checkout/shipping-methods

Get available shipping methods for address.

**Query Parameters**:
- `country` (string): Required
- `postal_code` (string): Required
- `weight_g` (int): Cart weight

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": "standard",
        "name": "Standard Shipping",
        "description": "5-7 business days",
        "cost": 599,
        "estimated_delivery": "2025-01-14"
      },
      {
        "id": "express",
        "name": "Express Shipping",
        "description": "2-3 business days",
        "cost": 1299,
        "estimated_delivery": "2025-01-10"
      }
    ]
  }
}
```

---

### POST /checkout

Create order from cart.

**Request**:
```json
{
  "shipping_address": {
    "first_name": "John",
    "last_name": "Doe",
    "address_1": "123 Main St",
    "address_2": "Apt 4B",
    "city": "Brooklyn",
    "state": "NY",
    "postal_code": "11201",
    "country": "US",
    "phone": "+1-555-0123"
  },
  "billing_address_same_as_shipping": false,
  "billing_address": { ... },
  "shipping_method": "standard",
  "payment_method": "stripe",
  "discount_code": "SUMMER20",
  "gift_card_code": "GIFT-ABC123",
  "newsletter_opt_in": true,
  "notes": "Leave at front door"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "ORD-2025-0001",
      "status": "pending",
      "total": 3110,
      "client_secret": "pi_xxx_secret_yyy"
    },
    "payment_intent": {
      "client_secret": "pi_xxx_secret_yyy",
      "amount": 3110
    }
  }
}
```

---

## Orders

### GET /orders

List user's orders.

**Query Parameters**:
- `page`, `per_page`: Pagination
- `status`: Filter by status
- `date_from`, `date_to`: Date range

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "order_number": "ORD-2025-0001",
        "status": "shipped",
        "total": 3110,
        "item_count": 2,
        "placed_at": "2025-01-07T10:30:00Z",
        "thumbnail": "https://cdn.example.com/products/eth-001-sm.jpg"
      }
    ]
  },
  "meta": { ... }
}
```

---

### GET /orders/:id

Get order details.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "ORD-2025-0001",
    "status": "shipped",
    "status_history": [
      {
        "status": "pending",
        "timestamp": "2025-01-07T10:30:00Z"
      },
      {
        "status": "processing",
        "timestamp": "2025-01-07T10:35:00Z"
      },
      {
        "status": "shipped",
        "timestamp": "2025-01-07T14:00:00Z"
      }
    ],
    "items": [...],
    "shipping_address": {...},
    "shipping_method": "standard",
    "tracking": {
      "carrier": "usps",
      "number": "9400111899223456789012",
      "url": "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899223456789012",
      "status": "in_transit"
    },
    "payment": {
      "method": "stripe",
      "last4": "4242",
      "amount": 3110
    },
    "totals": {
      "subtotal": 3600,
      "discount": 720,
      "shipping": 599,
      "tax": 231,
      "total": 3110
    },
    "can_cancel": false,
    "can_return": true,
    "invoice_url": "/orders/ord-2025-0001/invoice.pdf"
  }
}
```

---

### POST /orders/:id/reorder

Reorder previous order.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "cart_id": "uuid",
    "items_added": 2,
    "message": "Items added to cart"
  }
}
```

---

### POST /orders/:id/return

Request order return.

**Request**:
```json
{
  "items": [
    {
      "order_item_id": "uuid",
      "quantity": 1,
      "reason": "wrong_item",
      "notes": "Received decaf instead of regular"
    }
  ]
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "rma_number": "RMA-2025-0042",
    "status": "pending",
    "instructions": "Package items and attach provided label..."
  }
}
```

---

## Subscriptions

### GET /subscriptions

List user's subscriptions.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": "uuid",
        "status": "active",
        "frequency": "weekly",
        "next_billing_date": "2025-01-14",
        "next_delivery_date": "2025-01-16",
        "total": 3240,
        "item_count": 2
      }
    ]
  }
}
```

---

### GET /subscriptions/:id

Get subscription details.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "active",
    "frequency": "weekly",
    "discount_percent": 10,
    "next_billing_date": "2025-01-14",
    "next_delivery_date": "2025-01-16",
    "items": [
      {
        "id": "uuid",
        "product": { "name": "Ethiopia Yirgacheffe", ... },
        "variant": { "size": "500g", "grind": "whole_bean" },
        "quantity": 1,
        "price": 1620
      }
    ],
    "shipping_address": {...},
    "payment_method": {...},
    "history": [...]
  }
}
```

---

### PATCH /subscriptions/:id

Update subscription.

**Request**:
```json
{
  "frequency": "bi_weekly",
  "next_delivery_date": "2025-01-21"
}
```

**Response (200)**: Updated subscription

---

### POST /subscriptions/:id/skip

Skip next delivery.

**Request**:
```json
{
  "skip_count": 1
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "next_billing_date": "2025-01-21",
    "message": "Next delivery skipped"
  }
}
```

---

### POST /subscriptions/:id/pause

Pause subscription.

**Request**:
```json
{
  "resume_date": "2025-03-01"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "status": "paused",
    "scheduled_resume": "2025-03-01"
  }
}
```

---

### POST /subscriptions/:id/cancel

Cancel subscription.

**Request**:
```json
{
  "reason": "too_much_coffee",
  "feedback": "Going on a coffee break"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "status": "cancelled",
    "effective_date": "2025-01-14",
    "final_charge": false
  }
}
```

---

## Reviews

### GET /products/:id/reviews

Get product reviews.

**Query Parameters**:
- `sort`: recent/highest/lowest/helpful
- `rating`: Filter by star rating
- `verified_only`: boolean

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "average": 4.5,
      "total": 128,
      "distribution": { "5": 89, "4": 28, ... }
    },
    "reviews": [
      {
        "id": "uuid",
        "user": { "first_name": "Jane", "last_name": "S." },
        "rating": 5,
        "title": "Amazing coffee!",
        "content": "Bright citrus notes and very smooth...",
        "brewing_method": "pour_over",
        "is_verified": true,
        "helpful_count": 12,
        "images": [...],
        "created_at": "2025-01-05T14:30:00Z",
        "admin_response": null
      }
    ]
  },
  "meta": { ... }
}
```

---

### POST /products/:id/reviews

Submit review (verified purchasers only).

**Request**:
```json
{
  "rating": 5,
  "title": "Amazing coffee!",
  "content": "Bright citrus notes and very smooth. Perfect for pour over.",
  "brewing_method": "pour_over",
  "images": ["base64-encoded-image-data"]
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "review": { ... },
    "message": "Review submitted and pending approval"
  }
}
```

---

## Wishlist

### GET /wishlists

List user's wishlists.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "wishlists": [
      {
        "id": "uuid",
        "name": "My Favorites",
        "item_count": 5,
        "is_public": false
      }
    ]
  }
}
```

---

### GET /wishlists/:id

Get wishlist details.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Favorites",
    "items": [
      {
        "id": "uuid",
        "product": { ... },
        "variant": { ... },
        "added_price": 1800,
        "current_price": 1800,
        "is_available": true,
        "notes": "Try this next!"
      }
    ],
    "share_url": "https://roastery.example.com/wishlists/share/abc123",
    "is_public": false
  }
}
```

---

### POST /wishlists/:id/items

Add item to wishlist.

**Request**:
```json
{
  "product_id": "uuid",
  "variant_id": "uuid",
  "notes": "Try this next!"
}
```

**Response (201)**: Updated wishlist

---

### POST /wishlists/:id/move-to-cart

Move wishlist items to cart.

**Request**:
```json
{
  "item_ids": ["uuid", "uuid"]
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "moved_count": 2,
    "cart_id": "uuid"
  }
}
```

---

## Loyalty

### GET /loyalty

Get loyalty account.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "tier": "gold",
    "total_points_earned": 12500,
    "available_points": 3400,
    "annual_spend": 184000,
    "tier_progress": {
      "current": 184000,
      "next_tier": "platinum",
      "next_tier_threshold": 250000,
      "remaining": 66000
    },
    "referral_code": "JOHN20",
    "referral_earnings": 2500
  }
}
```

---

### GET /loyalty/transactions

Get points history.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "type": "earn",
        "amount": 180,
        "description": "Purchase: Order #ORD-2025-0001",
        "order_id": "uuid",
        "expires_at": "2026-01-07",
        "created_at": "2025-01-07T10:30:00Z"
      }
    ]
  }
}
```

---

### POST /loyalty/redeem

Redeem points at checkout.

**Request**:
```json
{
  "points": 500
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "discount_amount": 500,
    "remaining_points": 2900
  }
}
```

---

## User Profile

### GET /me

Get current user profile.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "customer@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1-555-0123",
    "role": "customer",
    "email_verified": true,
    "default_shipping_address": {...},
    "saved_payment_methods": [...],
    "preferences": {
      "newsletter": true,
      "sms_notifications": false
    }
  }
}
```

---

### PATCH /me

Update profile.

**Request**:
```json
{
  "first_name": "Johnny",
  "phone": "+1-555-0199"
}
```

**Response (200)**: Updated user

---

### GET /me/addresses

Get saved addresses.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "address_1": "123 Main St",
        "city": "Brooklyn",
        "state": "NY",
        "postal_code": "11201",
        "country": "US",
        "is_default_shipping": true,
        "is_default_billing": false
      }
    ]
  }
}
```

---

### POST /me/addresses

Add new address.

**Request**: Address object

**Response (201)**: Created address

---

### DELETE /me/addresses/:id

Delete address.

**Response (204)**: No content

---

## Admin Endpoints

### GET /admin/dashboard

Dashboard overview metrics.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "today": {
      "orders": 24,
      "revenue": 12499,
      "average_order_value": 520
    },
    "pending_orders": 8,
    "low_stock_count": 3,
    "active_subscriptions": 156,
    "recent_orders": [...],
    "top_products": [...]
  }
}
```

---

### GET /admin/orders

List all orders (admin).

**Query Parameters**:
- `status`, `date_from`, `date_to`: Filters
- `search`: Order number or customer email

**Response (200)**: Paginated orders with full details

---

### PATCH /admin/orders/:id/status

Update order status.

**Request**:
```json
{
  "status": "shipped",
  "tracking": {
    "carrier": "usps",
    "number": "9400111899223456789012"
  },
  "notes": "Shipped via Priority Mail"
}
```

**Response (200)**: Updated order

---

### GET /admin/products

List all products (admin).

**Response (200)**: Paginated products with inventory levels

---

### POST /admin/products

Create new product.

**Request**: Full product object with variants

**Response (201)**: Created product

---

### PATCH /admin/products/:id

Update product.

**Request**: Partial product object

**Response (200)**: Updated product

---

### POST /admin/inventory/adjust

Adjust inventory levels.

**Request**:
```json
{
  "variant_id": "uuid",
  "adjustment": 50,
  "reason": "restock",
  "notes": "Weekly roasting batch"
}
```

**Response (200)**: Updated inventory

---

## Webhooks

### POST /webhooks/stripe

Stripe webhook handler.

**Events**:
- `payment_intent.succeeded`: Process successful payment
- `payment_intent.payment_failed`: Handle failed payment
- `invoice.payment_succeeded`: Subscription renewal
- `invoice.payment_failed`: Subscription payment failure

---

### POST /webhooks/shipping/:carrier

Shipping carrier webhook handler.

**Events**:
- Tracking updates
- Delivery confirmations

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INSUFFICIENT_INVENTORY` | 400 | Not enough stock |
| `INVALID_DISCOUNT_CODE` | 400 | Code not valid/expired |
| `PAYMENT_FAILED` | 400 | Payment processing error |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 1000 requests/minute
- **Admin endpoints**: 500 requests/minute
- **Checkout**: 10 attempts/minute

---

**Related**: [Data Model](../data-model.md) | [Quickstart](../quickstart.md)
