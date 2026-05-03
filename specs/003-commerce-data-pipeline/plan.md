# Implementation Plan: Commerce Data Pipeline

**Branch**: `003-commerce-data-pipeline` | **Date**: 2026-04-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-commerce-data-pipeline/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace mocked checkout/cart data with real backend-driven commerce pipeline: cart → order creation → payment webhook → confirmation email. Transform checkout-centric spec into a full Shopify-style store by wiring the existing service layer to persistent order records.

**Technical approach**: Use existing cartService and checkoutService, add orderService backend, integrate payment webhooks for order status transitions, implement guest order tracking.

## Technical Context

**Language/Version**: TypeScript 5.8  
**Primary Dependencies**: React 19, Vite 6, TanStack React Query 5, Zustand 5, React Router 7, Stripe, Supabase  
**Storage**: Supabase (PostgreSQL) for orders, products, inventory; Redis for cart sessions (or localStorage fallback)  
**Testing**: Vitest, Playwright for E2E  
**Target Platform**: Web (responsive), Express backend server  
**Project Type**: E-commerce web application (frontend + backend API)  
**Performance Goals**: Checkout completion <3min, payment callback processing <30s  
**Constraints**: <200ms p95 for cart operations, offline cart persistence via localStorage  
**Scale/Scope**: Single-store e-commerce, ~100-1000 concurrent users  

## Constitution Check

No gates from constitution file - proceeding with standard frontend+backend structure.

## Project Structure

### Documentation (this feature)

```text
specs/003-commerce-data-pipeline/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md            # Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/
├── services/           # API service layer (existing: cart, checkout, products, etc.)
│   ├── cart.ts
│   ├── checkout.ts
│   ├── order.ts        # NEW: order service
│   └── index.ts
├── stores/             # State management (existing: cartStore, checkoutStore)
│   └── orderStore.ts   # NEW: order state
├── pages/
│   ├── Checkout/      # Existing checkout pages
│   ├── Account/      # Existing account pages
│   └── OrderTracking.tsx  # NEW: guest order tracking
├── hooks/
│   └── useOrder.ts    # NEW: order hooks
└── types/             # Shared types

server/
├── src/
│   ├── routes/
│   │   ├── orders.ts     # NEW: order endpoints
│   │   └── webhooks.ts  # NEW: payment webhooks
│   ├── services/
│   │   └── order.ts   # NEW: order business logic
│   └── index.ts
└── types/

tests/
├── unit/
├── integration/
└── e2e/
    └── checkout.spec.ts  # NEW: checkout flow tests
```

**Structure Decision**: Adding order service and order tracking to existing React frontend + Express backend structure.

## Complexity Tracking

No violations - standard e-commerce implementation path.

## Research (Phase 0)

### Decisions Made

| Area | Decision | Rationale |
|------|----------|------------|
| Order creation | Before payment confirmation | Matches Shopify pattern, allows payment retry |
| Order tracking | Via order number + email (guest) | Standard practice, maximizes conversion |
| Inventory check | At checkout completion (before payment) | Balances UX with inventory accuracy |
| Concurrent handling | Order locking mechanism | Prevents duplicate fulfillment |

### Additional Research Notes

- Payment webhook integration: Use Stripe webhooks via Express endpoint
- Order status workflow: pending → confirmed → processing → shipped → delivered
- Cart persistence: localStorage for guest, database for authenticated

## Design Phase (Phase 1)

### Data Model Entities

See `data-model.md` for full details:

- **Order**: orderId, customerId, items, status, shippingAddress, billingAddress, totals, createdAt, updatedAt
- **OrderItem**: orderItemId, orderId, productId, variantId, quantity, price
- **OrderStatus**: pending, confirmed, payment_failed, processing, shipped, delivered, cancelled, refunded

### Interface Contracts

See `contracts/` for full details:

- `OrderService.createOrder()` - Create pending order
- `OrderService.getOrder()` - Fetch order by ID
- `OrderService.updateStatus()` - Update order status
- `PaymentWebhook.process()` - Handle payment webhooks
- `OrderTracking.lookup()` - Guest order lookup

### Quickstart

See `quickstart.md` for development setup.