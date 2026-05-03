# Contracts: Payment Webhook

## processPaymentWebhook

Handle payment provider webhook for order status updates.

```typescript
interface PaymentWebhookPayload {
  type: 'payment_intent.succeeded' | 'payment_intent.payment_failed';
  data: {
    object: {
      id: string; // paymentIntentId
      metadata: {
        orderId: string;
      };
    };
  };
}
```

**Processing:**
1. Validate webhook signature
2. Look up order by `orderId` from metadata
3. Update order status based on webhook type
4. Send confirmation email on success

**Errors:**
- `INVALID_SIGNATURE` - Webhook verification failed
- `ORDER_NOT_FOUND` - No order matches orderId