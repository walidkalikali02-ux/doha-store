# Research: Commerce Data Pipeline

## Decisions Made

| Area | Decision | Rationale |
|------|----------|------------|
| Order creation timing | Before payment confirmation | Matches Shopify pattern; allows payment retry without duplicate order |
| Payment failure handling | Update existing order, don't create new | Prevents duplicate orders when retrying payment |
| Guest checkout | Email-only, no account required | Maximizes conversion, standard industry practice |
| Order tracking | Order number + email lookup | Works for both guest and authenticated customers |
| Inventory validation | At checkout completion (before payment) | Balances UX with inventory accuracy |
| Concurrent checkout | Order locking mechanism | Prevents double fulfillment of same item |
| Payment webhook | Create order first, then process webhook | Ensures order exists even if webhook is delayed |

## Implementation Patterns

### Order Lifecycle Pattern

```
[Cart] → [Create Order (pending)] → [Customer Pays] → [Webhook Received] → [Order Confirmed]
                              ↓
                        [Payment Failed] → [Retry Payment] → [Update Existing Order]
```

### Guest Checkout Pattern

```
[Cart] → [Enter Email] → [Create Order with email] → [Payment] → [Order Confirmed]
                                                                          ↓
[Order Tracking Page] ← [Order Number + Email] ← [Confirmation Email sent to email]
```

### Payment Webhook Pattern

```
[Payment Provider] → [Webhook Endpoint] → [Validate Signature] → [Update Order Status]
                                                              → [Send Confirmation Email]
```

## Alternatives Considered

- **Create order after payment**: Rejected because payment can fail after initial success, requiring order cleanup
- **Account required for checkout**: Rejected because guest checkout is critical for conversion
- **Inventory at cart add**: Rejected because inventory can change between cart add and checkout