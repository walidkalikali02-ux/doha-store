# API Reference — Doha Roastery Store

**Version**: 1.0
**Base URL**: `http://localhost:3001/api/v1`

---

## Table of Contents

1. [Overview](#overview)
2. [Order Status State Machine](#order-status-state-machine)
3. [Order Endpoints](#order-endpoints)
4. [Payment Endpoints](#payment-endpoints)
5. [Discount Endpoints](#discount-endpoints)
6. [Shipping Endpoints](#shipping-endpoints)
7. [Webhook Endpoints](#webhook-endpoints)
8. [MyFatoorah Payment Flow](#myfatoorah-payment-flow)
9. [MF InvoiceId Storage](#mf-invoiceid-storage)
10. [Error Codes](#error-codes)

---

## Overview

### Authentication

| Type | Header | Notes |
|------|--------|-------|
| Admin | `Authorization: Bearer <token>` | JWT from Supabase Auth |
| Guest | `Idempotency-Key` header | Optional, for duplicate prevention |
| Webhook | `x-myfatoorah-signature` | HMAC-SHA256 signature |

### Standard Response Format

```json
// Success (200/201)
{ "order": {...}, "mfInvoiceId": 123, "mfPaymentUrl": "https://..." }

// Error
{ "error": "ERROR_CODE", "code": 400, "message": "Human-readable message" }
```

---

## Order Status State Machine

```
                    ┌──────────────────────────────────────┐
                    │           ORDER STATUS                │
                    └──────────────────────────────────────┘

   ┌─────────┐     ┌───────────┐     ┌───────────┐     ┌──────────┐     ┌───────────┐
   │ pending │────▶│ confirmed │────▶│ processing│────▶│  shipped │────▶│ delivered │
   └────┬────┘     └─────┬─────┘     └─────┬─────┘     └────┬─────┘     └─────┬─────┘
        │                │                │                │                  │
        │                │                │                │                  │
        ▼                ▼                ▼                ▼                  ▼
   ┌──────────────┐  ┌────────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────────┐
   │payment_failed│  │ cancelled  │  │ cancelled │  │ cancelled │  │ refunded         │
   │  (retryable) │  │            │  │           │  │           │  │ cancelled        │
   └──────┬───────┘  └───────────┘  └───────────┘  └───────────┘  └──────────────────┘
          │                                                                ▲
          │                                                                │
          └─────────────────── (retry) ──────────────────────────────────┘
                               can return to pending
```

### Valid Transitions

| From | Allowed To |
|------|------------|
| `pending` | `confirmed`, `payment_failed`, `cancelled` |
| `confirmed` | `processing`, `cancelled` |
| `payment_failed` | `pending`, `cancelled` |
| `processing` | `shipped`, `cancelled` |
| `shipped` | `delivered`, `cancelled` |
| `delivered` | `refunded`, `cancelled` |
| `cancelled` | *(terminal)* |
| `refunded` | *(terminal)* |

**Terminal states**: `delivered`, `cancelled`, `refunded` — cannot be modified.

### Idempotency

- `POST /orders` accepts `Idempotency-Key` header (max 100 chars)
- Duplicate requests return `200` with existing order (not `201`)
- Keys expire after **24 hours**
- Response includes `duplicate: true` flag

---

## Order Endpoints

### POST /orders

Create a new order (guest or authenticated).

**Auth**: Optional JWT (admin) or `Idempotency-Key` header

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | No | Bearer token (admin orders) |
| `Idempotency-Key` | No | Unique key for idempotent requests |

**Request Body**:
```json
{
  "email": "customer@example.com",
  "customerId": "uuid",           // optional, for logged-in users
  "items": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 2,
      "unitPrice": 15000,
      "name": "Ethiopian Yirgacheffe"
    }
  ],
  "shippingAddress": {
    "line1": "123 Main St",
    "line2": "Apt 4",
    "city": "Doha",
    "state": "Doha",
    "postalCode": "12345",
    "country": "QA"
  },
  "shippingMethodId": "standard",
  "discountCode": "SAVE10",       // optional
  "paymentMethodId": 1
}
```

**Responses**:

| Status | Meaning |
|--------|---------|
| `201` | Order created successfully |
| `200` | Idempotent duplicate (same `Idempotency-Key`) |
| `409` | `INVENTORY_UNAVAILABLE` — item out of stock or lock conflict |
| `409` | `INVALID_STATUS_TRANSITION` — order in terminal state |
| `422` | Validation error |

**Success Response (201)**:
```json
{
  "order": {
    "id": "uuid",
    "orderNumber": "ORD-20260101-ABCDE",
    "status": "pending",
    "subtotal": 30000,
    "discountAmount": 3000,
    "shippingCost": 0,
    "total": 27000,
    "guestEmail": "customer@example.com",
    "shippingAddress": {...},
    "mfInvoiceId": null,
    "mfPaymentUrl": null
  },
  "mfInvoiceId": null,
  "mfPaymentUrl": null
}
```

**Error Response (409 — Inventory Conflict)**:
```json
{
  "error": "inventory_unavailable",
  "code": 409,
  "message": "Unable to reserve inventory - another transaction is in progress. Please retry in a moment."
}
```
> Note: When lock conflict detected, `Retry-After: 2` header is added.

---

### GET /orders/:orderId

Get order details by ID.

**Auth**: Required (JWT)

**Response**:
```json
{
  "order": {
    "id": "uuid",
    "orderNumber": "ORD-20260101-ABCDE",
    "status": "confirmed",
    "items": [...]
  }
}
```

---

### GET /orders/track?orderNumber=ORD-...&email=...

Track order by order number and email (guest access).

**Auth**: None

**Query Params**:
| Param | Type | Required |
|-------|------|----------|
| `orderNumber` | string | Yes |
| `email` | string | Yes |

**Response**:
```json
{
  "order": {
    "id": "uuid",
    "orderNumber": "ORD-20260101-ABCDE",
    "status": "confirmed",
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

### PATCH /orders/:orderId

Update order (e.g., shipping address).

**Auth**: Required (JWT)

**Request Body**:
```json
{
  "shippingAddress": {
    "line1": "456 New St",
    "city": "Doha",
    "country": "QA"
  }
}
```

**Constraints**:
- Can only update `shippingAddress`
- Cannot update if order status is `delivered`, `cancelled`, or `refunded`

---

### PATCH /orders/:orderId/status

Update order status (admin only).

**Auth**: Required (JWT, admin role)

**Request Body**:
```json
{
  "status": "shipped",
  "note": "Tracking: UPS123456"
}
```

**Responses**:
| Status | Meaning |
|--------|---------|
| `200` | Status updated |
| `400` | Invalid transition (see state machine) |

---

### POST /orders/admin/orders/:orderId/refund

Process a refund for a delivered order.

**Auth**: Required (JWT, admin role)

**Request Body**:
```json
{
  "refundAmount": 15000,
  "reason": "Customer request - item damaged"
}
```

**Responses**:

| Status | Meaning |
|--------|---------|
| `200` | Refund processed |
| `409` | Order not in `delivered` state (cannot refund) |

**Success Response**:
```json
{
  "order": {...},
  "refund": {
    "refundId": "REF-123456",
    "amount": 15000,
    "status": "Pending",
    "refundReference": "REF-123456"
  }
}
```

---

## Payment Endpoints

### POST /payment/initiate

Get available payment methods.

**Auth**: None

**Request Body**:
```json
{
  "InvoiceAmount": 27000,
  "CurrencyIso": "QAR"
}
```

**Response**:
```json
{
  "data": {
    "PaymentMethods": [
      {
        "PaymentMethodId": 1,
        "PaymentMethodEn": "Visa",
        "PaymentMethodAr": "فيزا",
        "ServiceCharge": 0,
        "TotalAmount": 27000,
        "IsDirectPayment": false
      }
    ]
  }
}
```

---

### POST /payment/execute

Execute payment and create MyFatoorah invoice.

**Auth**: None

**Request Body**:
```json
{
  "orderId": "uuid",
  "paymentMethodId": 1,
  "customerName": "أحمد محمد",
  "customerEmail": "customer@example.com",
  "customerMobile": "+97412345678",
  "successUrl": "http://localhost:3000/checkout/confirmation",
  "errorUrl": "http://localhost:3000/checkout/payment?error=1",
  "InvoiceItems": [
    { "ItemName": "Ethiopian Yirgacheffe", "Quantity": 2, "UnitPrice": 15000 }
  ]
}
```

**Important**: `InvoiceValue` (sum of `UnitPrice × Quantity`) must equal the order total.

**Discount Revalidation**: Before executing payment, the server revalidates the `discount_code` attached to the order. If the code is now expired, exhausted, or invalid, returns `409 discount_invalid`.

**Responses**:

| Status | Meaning |
|--------|---------|
| `200` | Invoice created |
| `409` | `discount_invalid` — code no longer valid |
| `409` | `order_not_retryable` — order not in `pending` or `payment_failed` |
| `422` | MyFatoorah API error |

**Success Response**:
```json
{
  "data": {
    "InvoiceId": 123456,
    "InvoiceURL": "https://apitest.myfatoorah.com/...",
    "PaymentMethodId": 1
  }
}
```

**Error Response (409 — Discount Invalid)**:
```json
{
  "error": "discount_invalid",
  "code": 409,
  "message": "This discount code has expired"
}
```

---

### POST /payment/refund

Process a refund via MyFatoorah.

**Auth**: Required (JWT, admin role)

**Request Body**:
```json
{
  "orderId": "uuid",
  "refundAmount": 15000,
  "reason": "Customer request"
}
```

**Response**:
```json
{
  "data": {
    "RefundId": "REF-123456",
    "Amount": 15000,
    "Status": "Pending",
    "RefundReference": "REF-123456"
  }
}
```

---

### GET /payment/callback

MyFatoorah payment callback — fallback if webhook fails.

**Query Params**:
| Param | Description |
|-------|-------------|
| `paymentId` | MyFatoorah PaymentId |
| `invoiceId` | MyFatoorah InvoiceId |
| `orderId` | Our order UUID (optional) |

**Flow**:
1. Customer returns from MyFatoorah
2. Server queries MyFatoorah API for payment status
3. If `Paid` and order is `pending` → transitions to `confirmed`
4. Sends confirmation email
5. Redirects to `/order/{orderNumber}/confirmation` or `/checkout/payment-failed`

**Redirects**:
| Payment Status | Redirect URL |
|---------------|--------------|
| Paid/Completed | `{FRONTEND_BASE_URL}/order/{orderNumber}/confirmation` |
| Failed/Expired | `{FRONTEND_BASE_URL}/checkout/payment-failed?orderId={id}` |
| Invalid params | `{FRONTEND_BASE_URL}/checkout/error?reason=invalid_callback` |

**Idempotency**: If order is already `confirmed`, callback returns existing order without re-sending email.

---

## Discount Endpoints

### POST /discounts/validate

Validate a discount code without applying it.

**Auth**: None (rate limited: 10 req/min per IP)

**Request Body**:
```json
{
  "code": "SAVE10",
  "orderSubtotal": 30000
}
```

**Responses**:

| Status | Meaning |
|--------|---------|
| `200` | Code valid |
| `400` | Invalid subtotal or missing code |
| `429` | Rate limited |

**Valid Response**:
```json
{
  "valid": true,
  "discount_amount": 3000,
  "type": "percentage",
  "value": 10
}
```

**Invalid Response**:
```json
{
  "valid": false,
  "error": "Discount code has expired"
}
```

---

## Shipping Endpoints

### POST /shipping

Get shipping rates for an address and cart.

**Auth**: None

**Request Body**:
```json
{
  "address": {
    "city": "Doha",
    "area": "Al Sadd",
    "country": "QA"
  },
  "cartItems": [
    { "productId": "uuid", "quantity": 2, "price": 15000, "weight": 0.5 }
  ]
}
```

**Response**:
```json
{
  "methods": [
    { "method": "standard", "label": "Standard Shipping", "cost": 0, "estimatedDays": "5-7 days" },
    { "method": "express", "label": "Express Shipping", "cost": 1250, "estimatedDays": "2-3 days" }
  ]
}
```

---

### GET /shipping/rates

Get shipping rates by weight and value (simple query).

**Query Params**: `weight`, `value`, `city`, `area`, `country`

---

## Webhook Endpoints

### POST /payment/webhook

MyFatoorah asynchronous webhook for payment status updates.

**Auth**: `x-myfatoorah-signature` HMAC-SHA256 header (matches `MYFATOORAH_WEBHOOK_SECRET`)

**Important**: The webhook signature is validated using the raw request body (Buffer). If signature is missing or invalid, returns `200` (not `401`) to prevent retries from MyFatoorah.

**Request Body** (JSON parsed from Buffer):
```json
{
  "EventType": "Payment",
  "InvoiceStatus": "Paid",
  "InvoiceId": 123456,
  "CustomerReference": "order-uuid",
  "TransactionId": "TXN-123456",
  "PaidCurrency": "QAR",
  "PaidAmount": 27000,
  "CustomerEmail": "customer@example.com",
  "CustomerName": "أحمد محمد"
}
```

### Supported Event Types

| EventType | InvoiceStatus | Action |
|-----------|---------------|--------|
| `Payment` | `Paid` | Confirm order → send confirmation email |
| `Payment` | `Failed` / `Expired` | Set order to `payment_failed` |
| `Refund` | *(any)* | Log refund event, update order if needed |

### Idempotency

- If order is already `confirmed` (or `payment_failed`), webhook returns `200` without re-processing
- Only transitions from `pending` are processed
- Prevents double-email on duplicate webhook delivery

### Response

Always returns `200` with `{ received: true }` — MyFatoorah should not retry.

---

## MyFatoorah Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              MYFATOORAH PAYMENT FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

 1. CUSTOMER                    2. FRONTEND                         3. OUR SERVER
    STARTS                                                                    │
    CHECKOUT                                                                  │
        │                                                                        │
        ▼                                                                        ▼
┌─────────────────┐                                                   ┌─────────────────────┐
│ POST /orders    │                                                   │ validateInventory() │
│ (create order)  │◄──────────────────────────────────────────────────│ SELECT FOR UPDATE   │
└─────────────────┘                                                   │ SKIP LOCKED         │
        │                                                            └─────────────────────┘
        │                                                                  │
        │                                                                  ▼
        │                                                         ┌─────────────────────┐
        │                                                         │ POST /payment/initiate
        │                                                         │ Get payment methods │
        │◄───────────────────────────────────────────────────────│                     │
        │                                                         └─────────────────────┘
        │                                                                  │
        ▼                                                                  ▼
┌─────────────────┐                                            ┌─────────────────────┐
│ POST /payment/  │                                            │ POST /payment/execute
│ execute        │───────────────────────────────────────────▶│ Create invoice      │
│ (selects PM)   │                                            │ InvoiceId + URL     │
└─────────────────┘                                            └─────────────────────┘
        │                                                                  │
        ▼                                                                  ▼
┌─────────────────┐                                            ┌─────────────────────┐
│ Redirect to     │                                            │ MyFatoorah API      │
│ InvoiceURL      │───────────────────────────────────────────▶│ Creates invoice     │
└─────────────────┘                                            └─────────────────────┘
        │
        ▼
┌─────────────────┐
│ MyFatoorah      │
│ Payment Page    │
└─────────────────┘
        │
        ├──▶ SUCCESS ─────────────────────────────────────────────────────────────┐
        │                                                                       │
        │  4a. WEBHOOK                           5. CONFIRM                    │
        │  POST /payment/webhook                  Order updated:               │
        │  {EventType:"Payment",                  status = confirmed          │
        │   InvoiceStatus:"Paid",                                          │
        │   InvoiceId, CustomerReference}          Confirmation email sent    │
        │                                                                     │
        │                                                                     ▼
        │                                                             ┌─────────────────────┐
        │                                                             │ GET /payment/callback│
        │                                                             │ (fallback if webhook │
        │                                                             │  missed)             │
        │                                                             └─────────────────────┘
        │
        └──▶ FAILURE ───────────────────────────────────────────────────────────────┐
                                                                                  │
        4b. WEBHOOK                                                                 │
        POST /payment/webhook                                                        │
        {EventType:"Payment",                                                       │
         InvoiceStatus:"Failed"}                                                    │
                                                                                  │
                                                                                  ▼
                                                                         ┌─────────────────────┐
                                                                         │ Order updated:       │
                                                                         │ status = payment_failed
                                                                         └─────────────────────┘
```

---

## MF InvoiceId Storage

| Field | Table | Type | Notes |
|-------|-------|------|-------|
| `mf_invoice_id` | `orders` | `text` | MyFatoorah InvoiceId (string) |
| `mf_payment_url` | `orders` | `text` | Payment page URL |
| `idempotency_key` | `orders` | `text` | Key used at order creation |

**InvoiceId Format**:
- MyFatoorah returns numeric InvoiceId (e.g., `123456`)
- Stored as string in `mf_invoice_id`
- Used as lookup key in webhook processing: `.eq('mf_invoice_id', payload.InvoiceId.toString())`

**Webhook Lookup Flow**:
```
Webhook payload.InvoiceId
         │
         ▼
.supabase.from('orders')
  .select('id, status, mf_invoice_id, guest_email')
  .eq('mf_invoice_id', InvoiceId.toString())
  .single()
         │
         ▼
  Found → validate status → transition
  Not found → log error, return 200 (stop retries)
```

---

## Error Codes

### Order Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `ORDER_NOT_FOUND` | 404 | Order does not exist |
| `ORDER_IMMUTABLE` | 409 | Order in terminal state |
| `INVALID_STATUS_TRANSITION` | 409 | Transition not allowed |
| `INVENTORY_UNAVAILABLE` | 409 | Item out of stock or lock conflict |
| `INVALID_DISCOUNT` | 422 | Discount code invalid |
| `DISCOUNT_INVALID` | 409 | Discount expired/exhausted at payment time |
| `INVALID_ADDRESS` | 422 | Shipping address validation failed |
| `INVALID_IDEMPOTENCY_KEY` | 400 | Key empty or >100 chars |
| `order_not_retryable` | 409 | Order not in retryable state |

### Payment Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `validation_error` | 422 | Invalid request body |
| `payment_failed` | 422 | MyFatoorah execution failed |
| `MYFATOORAH_NOT_CONFIGURED` | 503 | MyFatoorah credentials missing |
| `PAYMENT_STATUS_LOOKUP_FAILED` | 502 | MyFatoorah API unreachable |
| `refund_failed` | 422 | Refund execution failed |

### Webhook Error Codes

| Code | Description |
|------|-------------|
| `WEBHOOK_MISSING_SIGNATURE` | Missing `x-myfatoorah-signature` header |
| `WEBHOOK_SIGNATURE_MISMATCH` | HMAC verification failed |
| `WEBHOOK_PARSE_FAILED` | JSON parse error |
| `WEBHOOK_ORDER_NOT_FOUND` | No order matches InvoiceId |
| `WEBHOOK_MISSING_REFERENCE` | `CustomerReference` missing in payload |
| `EMAIL_SEND_FAILED` | Confirmation email failed to send |

### Idempotency Keys

| Key | HTTP Status | Description |
|-----|-------------|-------------|
| `invalid_idempotency_key` | 400 | Key empty, too long, or malformed |

---

## Appendix: Discount Validation Rules

| Rule | Error Message |
|------|---------------|
| Code not found | `Invalid discount code` |
| `is_active = false` | `Discount code is no longer active` |
| `expires_at < now` | `Discount code has expired` |
| `starts_at > now` | `Discount code is not yet active` |
| `uses_count >= max_uses` | `Discount code usage limit reached` |
| `orderSubtotal < min_order_amount` | `Minimum order amount of {X} required` |

Discount is **revalidated at payment execution time** — a code valid at checkout may become invalid if it expires between checkout and payment.
