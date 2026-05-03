# Data Model: Roastery E-Commerce Platform

**Date**: 2025-01-07  
**Feature**: Roastery E-Commerce Platform  
**Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

---

## Entity Relationship Overview

```
User ||--o{ Order : places
User ||--o{ Subscription : has
User ||--o{ Review : writes
User ||--o{ Wishlist : creates
User ||--o{ LoyaltyAccount : earns
User ||--o{ Address : has
User ||--o{ PaymentMethod : saves

Product }o--|| Category : belongs_to
Product ||--o{ ProductVariant : has
Product ||--o{ ProductImage : has
Product }o--o{ Tag : tagged_with
Product ||--o{ Review : receives

ProductVariant ||--o{ CartItem : in_cart
ProductVariant ||--o{ OrderItem : ordered
ProductVariant ||--o{ SubscriptionItem : subscribed

Order ||--|{ OrderItem : contains
Order ||--|| Payment : has
Order ||--|| Shipment : shipped_via
Order ||--o{ OrderStatusHistory : tracks

Subscription ||--|{ SubscriptionItem : contains
Subscription ||--o{ SubscriptionHistory : tracks

LoyaltyAccount ||--o{ LoyaltyTransaction : earns
LoyaltyAccount ||--o{ Referral : generates

Wishlist ||--|{ WishlistItem : contains

DiscountCode }o--o{ Order : applies_to
```

---

## Core Entities

### User

Represents a customer or administrator in the system.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| email | String | UNIQUE, NOT NULL | Login identifier |
| password_hash | String | NOT NULL | bcrypt hashed password |
| first_name | String | NOT NULL | User's first name |
| last_name | String | NOT NULL | User's last name |
| phone | String | NULLABLE | Contact number |
| role | Enum | DEFAULT 'customer' | guest/customer/wholesale/admin/super_admin |
| email_verified | Boolean | DEFAULT false | Verification status |
| email_verified_at | DateTime | NULLABLE | When email was verified |
| status | Enum | DEFAULT 'active' | active/suspended/deleted |
| deleted_at | DateTime | NULLABLE | Soft delete timestamp |
| created_at | DateTime | NOT NULL | Account creation |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Has many `Address`
- Has many `PaymentMethod`
- Has many `Order`
- Has many `Subscription`
- Has many `Review`
- Has many `Wishlist`
- Has one `LoyaltyAccount`
- Has one `Cart` (for guests, via session)

**Indexes**:
- email (UNIQUE)
- role + status (for admin queries)

---

### Product

Represents a sellable item (coffee beans, equipment, accessories, merchandise).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | String | NOT NULL | Product name |
| slug | String | UNIQUE, NOT NULL | URL-friendly identifier |
| sku | String | UNIQUE, NOT NULL | Stock keeping unit |
| description_short | Text | NOT NULL | Brief description (meta/featured) |
| description_long | Text | NULLABLE | Full description |
| type | Enum | NOT NULL | coffee/equipment/accessories/merchandise/gift |
| base_price | Decimal | NOT NULL | Starting price (in cents) |
| status | Enum | DEFAULT 'draft' | draft/published/archived |
| published_at | DateTime | NULLABLE | When published |
| seo_title | String | NULLABLE | Meta title |
| seo_description | Text | NULLABLE | Meta description |
| is_featured | Boolean | DEFAULT false | Featured on homepage |
| weight_g | Integer | NULLABLE | Base weight in grams |
| origin_country | String | NULLABLE | Coffee origin country |
| origin_region | String | NULLABLE | Coffee origin region |
| farm | String | NULLABLE | Coffee farm name |
| roast_level | Enum | NULLABLE | light/medium/medium-dark/dark |
| processing_method | Enum | NULLABLE | washed/natural/honey |
| altitude_m | Integer | NULLABLE | Altitude in meters |
| flavor_notes | Array[String] | NULLABLE | e.g., ["chocolate", "citrus", "berry"] |
| brewing_recommendations | Text | NULLABLE | Brewing guide text |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Belongs to `Category`
- Has many `ProductVariant`
- Has many `ProductImage`
- Has many `Review`
- Many-to-many `Tag`

**Indexes**:
- slug (UNIQUE)
- sku (UNIQUE)
- type + status (for catalog filtering)
- origin_country + roast_level (for coffee filters)

---

### ProductVariant

Represents specific product configurations (size × grind combinations).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| product_id | UUID | FK, NOT NULL | Parent product |
| sku | String | UNIQUE, NOT NULL | Variant SKU |
| size | Enum | NOT NULL | 250g/500g/1kg/5kg |
| grind | Enum | NOT NULL | whole_bean/espresso/filter/french_press/pour_over/turkish/cold_brew |
| price_adjustment | Integer | DEFAULT 0 | Price delta from base (in cents) |
| weight_g | Integer | NOT NULL | Actual weight in grams |
| inventory_quantity | Integer | DEFAULT 0 | Current stock level |
| reserved_quantity | Integer | DEFAULT 0 | Reserved in carts |
| available_quantity | Integer | GENERATED | inventory - reserved |
| low_stock_threshold | Integer | DEFAULT 10 | Alert threshold |
| status | Enum | DEFAULT 'active' | active/disabled/out_of_stock |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Belongs to `Product`
- Has many `CartItem`
- Has many `OrderItem`
- Has many `SubscriptionItem`

**Constraints**:
- available_quantity >= 0 (CHECK constraint)
- UNIQUE(product_id, size, grind)

**Indexes**:
- sku (UNIQUE)
- product_id + status (for product page)
- available_quantity (for low stock queries)

---

### Category

Product organization hierarchy.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | String | NOT NULL | Category name |
| slug | String | UNIQUE, NOT NULL | URL-friendly identifier |
| type | Enum | NOT NULL | product_type/origin/roast_level |
| parent_id | UUID | FK, NULLABLE | Parent category (self-referential) |
| sort_order | Integer | DEFAULT 0 | Display order |
| description | Text | NULLABLE | Category description |
| image_url | String | NULLABLE | Category image |
| is_active | Boolean | DEFAULT true | Visibility |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Has many `Product`
- Belongs to `Category` (parent)
- Has many `Category` (children)

**Indexes**:
- slug (UNIQUE)
- type + is_active (for navigation)
- parent_id (for tree traversal)

---

### Tag

Product labels for filtering (organic, fair trade, etc.).

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| name | String | UNIQUE, NOT NULL | Tag name |
| slug | String | UNIQUE, NOT NULL | URL-friendly identifier |
| description | Text | NULLABLE | Tag description |
| color | String | NULLABLE | UI color hex code |
| is_active | Boolean | DEFAULT true | Visibility |
| created_at | DateTime | NOT NULL | Creation timestamp |

**Relationships**:
- Many-to-many `Product`

**Indexes**:
- slug (UNIQUE)
- name (UNIQUE)

---

### Cart / CartItem

Shopping cart state (guest or authenticated).

**Cart Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK, NULLABLE | Owner (null for guest) |
| session_id | String | NULLABLE | Guest session identifier |
| status | Enum | DEFAULT 'active' | active/abandoned/converted |
| expires_at | DateTime | NOT NULL | Cart expiration (30 days for guests) |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**CartItem Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| cart_id | UUID | FK, NOT NULL | Parent cart |
| variant_id | UUID | FK, NOT NULL | Product variant |
| quantity | Integer | NOT NULL, CHECK > 0 | Item quantity |
| unit_price | Integer | NOT NULL | Price at add time (cents) |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Cart belongs to `User` (optional)
- Cart has many `CartItem`
- CartItem belongs to `ProductVariant`

**Constraints**:
- Either user_id OR session_id must be set
- Quantity <= available inventory (enforced at add/update)

---

### Order / OrderItem

Completed purchase records.

**Order Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| order_number | String | UNIQUE, NOT NULL | Human-readable order ID (e.g., ORD-2025-0001) |
| user_id | UUID | FK, NULLABLE | Customer (null for guest checkout) |
| status | Enum | DEFAULT 'pending' | pending/processing/roasting/shipped/delivered/cancelled/refunded |
| email | String | NOT NULL | Customer email (for guests) |
| shipping_address | JSONB | NOT NULL | Full address object |
| billing_address | JSONB | NOT NULL | Full address object |
| shipping_method | Enum | NOT NULL | standard/express/overnight/local_pickup |
| shipping_cost | Integer | NOT NULL | Shipping cost (cents) |
| subtotal | Integer | NOT NULL | Sum of items (cents) |
| tax_amount | Integer | NOT NULL | Tax (cents) |
| discount_amount | Integer | DEFAULT 0 | Discount applied (cents) |
| total | Integer | NOT NULL | Final total (cents) |
| discount_code_id | UUID | FK, NULLABLE | Applied discount |
| notes | Text | NULLABLE | Customer order notes |
| internal_notes | Text | NULLABLE | Admin-only notes |
| placed_at | DateTime | NOT NULL | Order placement time |
| estimated_delivery | Date | NULLABLE | Delivery estimate |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**OrderItem Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| order_id | UUID | FK, NOT NULL | Parent order |
| variant_id | UUID | FK, NOT NULL | Product variant |
| product_name | String | NOT NULL | Product name (snapshot) |
| variant_description | String | NOT NULL | e.g., "500g - Whole Bean" |
| quantity | Integer | NOT NULL | Item quantity |
| unit_price | Integer | NOT NULL | Price at purchase (cents) |
| total_price | Integer | NOT NULL | quantity × unit_price |
| created_at | DateTime | NOT NULL | Creation timestamp |

**Relationships**:
- Order belongs to `User` (optional)
- Order has many `OrderItem`
- Order has one `Payment`
- Order has one `Shipment`
- Order has many `OrderStatusHistory`
- Order may have `DiscountCode`

**Indexes**:
- order_number (UNIQUE)
- user_id + status (for order history)
- status + placed_at (for admin dashboard)
- email (for guest order lookup)

---

### OrderStatusHistory

Audit trail of order status changes.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| order_id | UUID | FK, NOT NULL | Parent order |
| status | Enum | NOT NULL | New status |
| previous_status | Enum | NULLABLE | Previous status |
| changed_by | UUID | FK, NULLABLE | Admin user who changed (null for system) |
| notes | Text | NULLABLE | Change notes |
| created_at | DateTime | NOT NULL | Timestamp |

**Relationships**:
- Belongs to `Order`
- Belongs to `User` (admin who made change)

---

### Payment

Payment transaction records.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| order_id | UUID | FK, NOT NULL | Associated order |
| amount | Integer | NOT NULL | Payment amount (cents) |
| status | Enum | DEFAULT 'pending' | pending/authorized/captured/failed/refunded/partially_refunded |
| method | Enum | NOT NULL | stripe/paypal/apple_pay/google_pay/gift_card |
| provider_transaction_id | String | NULLABLE | External transaction ID |
| provider_response | JSONB | NULLABLE | Full provider response |
| failure_reason | Text | NULLABLE | If failed |
| captured_at | DateTime | NULLABLE | When captured |
| refunded_at | DateTime | NULLABLE | When refunded |
| refund_amount | Integer | NULLABLE | Refund amount (cents) |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Belongs to `Order`

**Indexes**:
- order_id (UNIQUE - one primary payment per order)
- provider_transaction_id (for reconciliation)
- status + created_at (for reporting)

---

### Shipment

Order fulfillment and tracking.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| order_id | UUID | FK, NOT NULL | Associated order |
| carrier | Enum | NOT NULL | usps/ups/fedex/dhl |
| service_level | String | NOT NULL | e.g., "Priority Mail", "Ground" |
| tracking_number | String | NULLABLE | Carrier tracking number |
| tracking_url | String | NULLABLE | Carrier tracking URL |
| status | Enum | DEFAULT 'pending' | pending/label_created/in_transit/out_for_delivery/delivered/exception |
| weight_oz | Integer | NULLABLE | Shipment weight |
| shipped_at | DateTime | NULLABLE | When handed to carrier |
| delivered_at | DateTime | NULLABLE | When delivered |
| estimated_delivery | Date | NULLABLE | Estimated delivery date |
| cost | Integer | NOT NULL | Shipping cost (cents) |
| label_url | String | NULLABLE | Generated label URL |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Belongs to `Order`

**Indexes**:
- order_id (UNIQUE - one shipment per order initially)
- tracking_number (for lookup)
- status (for admin dashboard)

---

### Subscription

Recurring order management.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK, NOT NULL | Subscriber |
| status | Enum | DEFAULT 'active' | active/paused/cancelled/past_due |
| frequency | Enum | NOT NULL | weekly/bi_weekly/monthly |
| start_date | Date | NOT NULL | First delivery date |
| next_billing_date | Date | NOT NULL | Next charge date |
| last_billing_date | Date | NULLABLE | Last successful charge |
| discount_percent | Integer | DEFAULT 10 | Subscription discount (10% default) |
| payment_method_id | UUID | FK, NOT NULL | Default payment method |
| shipping_address | JSONB | NOT NULL | Delivery address |
| stripe_subscription_id | String | NULLABLE | Stripe subscription ID |
| cancellation_reason | Text | NULLABLE | Why cancelled |
| cancelled_at | DateTime | NULLABLE | When cancelled |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Belongs to `User`
- Has many `SubscriptionItem`
- Has many `SubscriptionHistory`
- References `PaymentMethod`

**Indexes**:
- user_id + status (for subscription management)
- next_billing_date (for billing job)
- stripe_subscription_id (for webhook handling)

---

### SubscriptionItem

Individual products in a subscription.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| subscription_id | UUID | FK, NOT NULL | Parent subscription |
| variant_id | UUID | FK, NOT NULL | Product variant |
| quantity | Integer | NOT NULL | Quantity per delivery |
| unit_price | Integer | NOT NULL | Price at subscription (cents) |
| is_active | Boolean | DEFAULT true | Currently included |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Belongs to `Subscription`
- Belongs to `ProductVariant`

**Indexes**:
- subscription_id + is_active (for current items)

---

### SubscriptionHistory

Audit trail of subscription changes.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| subscription_id | UUID | FK, NOT NULL | Parent subscription |
| action | Enum | NOT NULL | created/paused/resumed/cancelled/skipped/modified/billed |
| details | JSONB | NULLABLE | Change details |
| created_at | DateTime | NOT NULL | Timestamp |

**Relationships**:
- Belongs to `Subscription`

---

### Review

Customer product reviews.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK, NOT NULL | Reviewer |
| product_id | UUID | FK, NOT NULL | Product reviewed |
| order_id | UUID | FK, NOT NULL | Verifying purchase |
| rating | Integer | NOT NULL, CHECK 1-5 | Star rating |
| title | String | NOT NULL | Review title |
| content | Text | NOT NULL | Review text (min 50 chars) |
| brewing_method | Enum | NULLABLE | brewing method used |
| is_verified_purchase | Boolean | DEFAULT false | Verified badge |
| status | Enum | DEFAULT 'pending' | pending/approved/rejected |
| helpful_count | Integer | DEFAULT 0 | Helpful votes |
| images | Array[String] | NULLABLE | Photo URLs (max 5) |
| admin_response | Text | NULLABLE | Seller response |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Belongs to `User`
- Belongs to `Product`
- Belongs to `Order` (verification)

**Constraints**:
- UNIQUE(user_id, product_id) - one review per product per customer

**Indexes**:
- product_id + status (for product page)
- user_id (for review history)
- rating (for analytics)

---

### Wishlist / WishlistItem

Saved products for later.

**Wishlist Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK, NOT NULL | Owner |
| name | String | NOT NULL | e.g., "My Favorites", "Gift Ideas" |
| is_public | Boolean | DEFAULT false | Shareable |
| share_token | String | UNIQUE, NULLABLE | Public share token |
| notify_on_sale | Boolean | DEFAULT true | Email alerts |
| notify_on_stock | Boolean | DEFAULT true | Back-in-stock alerts |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**WishlistItem Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| wishlist_id | UUID | FK, NOT NULL | Parent wishlist |
| product_id | UUID | FK, NOT NULL | Product saved |
| variant_id | UUID | FK, NULLABLE | Specific variant (if selected) |
| added_price | Integer | NOT NULL | Price when added (cents) |
| notes | Text | NULLABLE | Personal notes |
| priority | Integer | DEFAULT 0 | Sort priority |
| created_at | DateTime | NOT NULL | Creation timestamp |

**Relationships**:
- Wishlist belongs to `User`
- Wishlist has many `WishlistItem`
- WishlistItem belongs to `Product`
- WishlistItem optionally belongs to `ProductVariant`

**Indexes**:
- user_id (for user's wishlists)
- share_token (UNIQUE, for public access)

---

### LoyaltyAccount

Customer rewards program participation.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| user_id | UUID | FK, UNIQUE, NOT NULL | Owner |
| total_points_earned | Integer | DEFAULT 0 | Lifetime points |
| available_points | Integer | DEFAULT 0 | Current balance |
| tier | Enum | DEFAULT 'bronze' | bronze/silver/gold/platinum |
| annual_spend | Integer | DEFAULT 0 | Current year spend (cents) |
| tier_qualification_date | Date | NOT NULL | Tier reset date |
| referral_code | String | UNIQUE, NOT NULL | Unique referral code |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Belongs to `User`
- Has many `LoyaltyTransaction`
- Has many `Referral`

**Indexes**:
- user_id (UNIQUE)
- referral_code (UNIQUE)

---

### LoyaltyTransaction

Points activity log.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| loyalty_account_id | UUID | FK, NOT NULL | Parent account |
| type | Enum | NOT NULL | earn/redeem/expire/adjust |
| amount | Integer | NOT NULL | Points amount |
| description | String | NOT NULL | e.g., "Purchase: Order #1234" |
| order_id | UUID | FK, NULLABLE | Related order |
| expires_at | Date | NULLABLE | Expiration for earned points |
| created_at | DateTime | NOT NULL | Timestamp |

**Relationships**:
- Belongs to `LoyaltyAccount`
- May belong to `Order`

**Indexes**:
- loyalty_account_id + created_at (for history)
- expires_at (for expiration job)

---

### Referral

Referral program tracking.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| referrer_id | UUID | FK, NOT NULL | Referring customer |
| referred_email | String | NOT NULL | Invited email |
| referral_code | String | NOT NULL | Code used |
| status | Enum | DEFAULT 'pending' | pending/registered/purchased/expired |
| reward_points | Integer | NULLABLE | Points awarded to referrer |
| reward_discount | Integer | NULLABLE | Discount for referred (cents) |
| converted_at | DateTime | NULLABLE | When referred made purchase |
| expires_at | DateTime | NOT NULL | Referral expiration |
| created_at | DateTime | NOT NULL | Creation timestamp |

**Relationships**:
- Belongs to `User` (referrer)

**Indexes**:
- referrer_id (for earnings)
- referred_email (for lookup)
- referral_code (for validation)

---

### DiscountCode

Promotional codes.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| code | String | UNIQUE, NOT NULL | Discount code (e.g., "SUMMER20") |
| type | Enum | NOT NULL | percentage/fixed_amount |
| value | Integer | NOT NULL | Percentage or cents |
| minimum_order_amount | Integer | NULLABLE | Min order (cents) |
| maximum_discount | Integer | NULLABLE | Max discount (cents) |
| usage_limit_total | Integer | NULLABLE | Max total uses |
| usage_limit_per_customer | Integer | NULLABLE | Max per customer |
| used_count | Integer | DEFAULT 0 | Current usage |
| starts_at | DateTime | NOT NULL | Activation time |
| expires_at | DateTime | NOT NULL | Expiration time |
| is_stackable | Boolean | DEFAULT false | Combine with other codes |
| applies_to_products | Array[UUID] | NULLABLE | Specific products |
| applies_to_categories | Array[UUID] | NULLABLE | Specific categories |
| applies_to_customer_groups | Array[String] | NULLABLE | e.g., ["wholesale"] |
| is_active | Boolean | DEFAULT true | Currently active |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Has many `Order`

**Indexes**:
- code (UNIQUE)
- is_active + starts_at + expires_at (for validation)

---

### GiftCard

Stored value gift cards.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| code | String | UNIQUE, NOT NULL | Gift card code |
| initial_balance | Integer | NOT NULL | Starting amount (cents) |
| current_balance | Integer | NOT NULL | Remaining balance |
| purchaser_id | UUID | FK, NULLABLE | Who bought it |
| recipient_email | String | NULLABLE | Gift recipient |
| message | Text | NULLABLE | Gift message |
| status | Enum | DEFAULT 'active' | active/redeemed/expired/cancelled |
| expires_at | Date | NULLABLE | Expiration date |
| redeemed_at | DateTime | NULLABLE | When fully used |
| created_at | DateTime | NOT NULL | Creation timestamp |
| updated_at | DateTime | NOT NULL | Last update |

**Relationships**:
- Belongs to `User` (purchaser)

**Indexes**:
- code (UNIQUE)
- current_balance (for balance checks)

---

## Data Integrity Rules

### Constraints

1. **Inventory Non-Negative**: `available_quantity` (calculated) must never be negative
2. **Unique Reviews**: One review per user per product
3. **Order Total**: Sum of items must match order total
4. **Subscription Active Items**: At least one active item required for active subscription
5. **Points Balance**: `available_points` must equal sum of non-expired earned - redeemed

### Triggers

1. **Inventory Reservation**: On cart add, increment `reserved_quantity`
2. **Inventory Release**: On cart expiry, decrement `reserved_quantity`
3. **Order Inventory Deduct**: On order placement, decrement `inventory_quantity`
4. **Points Expiration**: Daily job to expire old points
5. **Tier Upgrade**: On annual spend threshold, upgrade tier

### Cascading Deletes

1. **User Deletion**: Soft delete only (90-day retention), preserve orders
2. **Product Deletion**: Archive only, preserve order history
3. **Category Deletion**: Reassign products to parent or default category

---

## Indexing Strategy

### High-Frequency Queries

1. **Product Catalog**: Composite index on (status, type, is_featured)
2. **Order History**: Composite index on (user_id, placed_at DESC)
3. **Cart Retrieval**: Index on (session_id) for guests, (user_id) for authenticated
4. **Subscription Billing**: Index on (status, next_billing_date)

### Search

1. **Product Search**: Full-text index on (name, description, sku)
2. **Tag Search**: Index on slug for quick lookups

### Admin Dashboard

1. **Pending Orders**: Partial index on status = 'pending'
2. **Low Stock**: Partial index on available_quantity < low_stock_threshold
3. **Recent Reviews**: Index on created_at DESC with status filter

---

**Next Phase**: API Contracts in `/contracts/` directory
