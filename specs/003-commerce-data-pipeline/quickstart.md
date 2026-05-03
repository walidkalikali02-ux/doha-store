# Quickstart: Commerce Data Pipeline

## Development Setup

### Prerequisites

- Node.js 20+
- Supabase project configured
- Payment provider account (Stripe)

### Environment Variables

```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=<supabase-url>
VITE_SUPABASE_ANON_KEY=<anon-key>
STRIPE_PUBLISHABLE_KEY=<stripe-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
```

### Running Development

```bash
# Frontend
npm run dev

# Backend
npm run dev:server

# Both
npm run dev:all
```

### Key Implementation Files

| File | Purpose |
|------|---------|
| `src/services/order.ts` | Order service API |
| `src/stores/orderStore.ts` | Order state management |
| `src/pages/OrderTracking.tsx` | Guest order tracking page |
| `server/src/routes/orders.ts` | Order API endpoints |
| `server/src/routes/webhooks.ts` | Payment webhooks |

### Testing Checkout Flow

1. Add items to cart
2. Proceed to checkout
3. Enter shipping address
4. Select shipping method
5. Select payment method
6. Review order
7. Complete payment
8. Receive confirmation email

### Expected Behavior

- Order created with `pending` status before payment
- Status updates to `confirmed` after payment webhook
- Cart items removed after successful order
- Confirmation email sent to customer email