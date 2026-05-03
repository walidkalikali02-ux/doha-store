# Contracts: Order Service

## createOrder

Create a new order in pending status.

```typescript
interface CreateOrderRequest {
  email: string;
  items: {
    variantId: string;
    quantity: number;
  }[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethodId: string;
  paymentMethodId: string;
  discountCode?: string;
}

interface CreateOrderResponse {
  order: Order;
  clientSecret: string; // For payment processing
}
```

**Errors:**
- `INVENTORY_UNAVAILABLE` - Item out of stock
- `INVALID_DISCOUNT` - Discount code invalid or expired
- `INVALID_ADDRESS` - Address validation failed

---

## getOrder

Fetch order by ID.

```typescript
interface GetOrderRequest {
  orderId: string;
}

interface GetOrderResponse {
  order: Order;
}
```

**Errors:**
- `ORDER_NOT_FOUND` - Order doesn't exist
- `ORDER_ACCESS_DENIED` - Not authorized to view order

---

## getOrderByNumber

Fetch order by order number (for tracking).

```typescript
interface GetOrderByNumberRequest {
  orderNumber: string;
  email: string;
}

interface GetOrderByNumberResponse {
  order: Order;
}
```

**Errors:**
- `ORDER_NOT_FOUND` - No order matches

---

## updateOrderStatus

Update order status (admin).

```typescript
interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
}

interface UpdateOrderStatusResponse {
  order: Order;
}
```

**Errors:**
- `INVALID_STATUS` - Invalid status transition
- `ORDER_NOT_FOUND`

---

## updateOrder

Update order details before confirmation.

```typescript
interface UpdateOrderRequest {
  orderId: string;
  updates: Partial<Pick<Order, 'shippingAddress' | 'billingAddress' | 'shippingMethodId'>>;
}

interface UpdateOrderResponse {
  order: Order;
}
```

**Errors:**
- `ORDER_NOT_FOUND`
- `ORDER_ALREADY_CONFIRMED` - Cannot modify confirmed order