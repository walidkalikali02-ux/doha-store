# Data Model: Commerce Data Pipeline

## Entities

### Order

| Field | Type | Validation | Notes |
|-------|------|-----------|--------|
| id | string (UUID) | Required | Primary key |
| orderNumber | string | Required, unique | Customer-facing order ID |
| customerId | string \| null | Optional | Null for guest orders |
| email | string | Required | Customer email |
| status | OrderStatus | Required | Current order state |
| items | OrderItem[] | Required, min 1 | Line items |
| subtotal | number | Required | Sum of item prices |
| shippingCost | number | Required | Shipping fee |
| taxAmount | number | Required | Tax calculated |
| discountAmount | number | Required | Discount applied |
| total | number | Required | Final total |
| shippingAddress | Address | Required | Shipping destination |
| billingAddress | Address | Required | Billing destination |
| shippingMethodId | string | Required | Selected shipping |
| paymentMethodId | string | Required | Selected payment |
| paymentIntentId | string \| null | Optional | Payment processor reference |
| notes | string | Optional | Customer notes |
| createdAt | timestamp | Required | Creation time |
| updatedAt | timestamp | Required | Last update |

### OrderStatus Enum

```
pending → confirmed → processing → shipped → delivered
    ↓         ↓          ↓          ↓
  failed   cancelled  refunded
```

Valid transitions:
- pending → confirmed (payment success)
- pending → payment_failed (payment failure)
- pending → cancelled (customer or admin)
- confirmed → processing (preparing)
- confirmed → cancelled
- processing → shipped
- shipped → delivered
- confirmed → refunded
- processing → refunded
- shipped → refunded

### OrderItem

| Field | Type | Validation | Notes |
|-------|------|-----------|--------|
| id | string (UUID) | Required | Primary key |
| orderId | string | Required | Foreign key to Order |
| productId | string | Required | Product reference |
| variantId | string | Required | Variant reference |
| name | string | Required | Product name at time of purchase |
| sku | string | Required | SKU at time of purchase |
| quantity | number | Required, min 1 | Quantity ordered |
| price | number | Required | Unit price at purchase |
| total | number | Required | quantity × price |

### Cart (Reference - existing)

| Field | Type | Notes |
|-------|------|-------|
| id | string | Session or customer-scoped |
| items | CartItem[] | Current cart contents |
| discountCode | string \| null | Applied code |
| updatedAt | timestamp | Last modification |

### Discount

| Field | Type | Validation | Notes |
|-------|------|-----------|--------|
| code | string | Required, unique | Promo code |
| type | 'percentage' \| 'fixed' | Required | Discount type |
| value | number | Required | Discount amount |
| minOrderAmount | number | Optional | Minimum order total |
| maxUses | number | Optional | Usage limit |
| usedCount | number | Required | Current uses |
| startsAt | timestamp | Optional | Start date |
| expiresAt | timestamp | Optional | Expiration date |
| active | boolean | Required | Is code valid |

## Relationships

```
Customer (1) ───→ (0..N) Order
Order (1) ───→ (0..N) OrderItem
OrderItem (N) ───→ (1) Product
OrderItem (N) ───→ (1) ProductVariant
Discount (1) ───→ (0..N) Order (via code)
```

## Validation Rules

1. Order must have at least one item
2. Order total must be ≥ 0
3. Discount code must be valid and active at time of order
4. Inventory must be available for all items
5. Email is required for order and confirmation
6. Shipping address required for physical items