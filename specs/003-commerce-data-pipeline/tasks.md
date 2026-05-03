# Tasks: Commerce Data Pipeline

**Input**: Design documents from `/specs/003-commerce-data-pipeline/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: E2E tests included per spec requirements. Unit/integration tests optional.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/`
- **Backend**: `server/src/`
- **Tests**: `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan (src/, server/src/, tests/)
- [ ] T002 [P] Configure environment variables in `.env` per quickstart.md
- [ ] T003 [P] Install dependencies: React 19, Vite 6, TanStack React Query 5, Zustand 5, React Router 7, Stripe, Supabase client
- [ ] T004 [P] Install backend dependencies: Express, Supabase admin client, Stripe SDK, email service
- [ ] T005 Configure Vitest and Playwright test frameworks

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Setup Supabase database schema with migrations for orders, order_items, discounts tables per data-model.md
- [ ] T007 [P] Create shared TypeScript types in `src/types/order.ts`, `src/types/cart.ts`, `src/types/discount.ts` per data-model.md
- [ ] T008 [P] Create shared TypeScript types in `server/src/types/` mirroring frontend types
- [ ] T009 Implement Supabase client configuration in `src/lib/supabase.ts` and `server/src/lib/supabase.ts`
- [ ] T010 [P] Setup Express server structure in `server/src/index.ts` with CORS, JSON parsing, error middleware
- [ ] T011 [P] Configure API routing structure in `server/src/routes/` with index router
- [ ] T012 Implement Stripe client configuration in `server/src/lib/stripe.ts`
- [ ] T013 Configure email service client in `server/src/lib/email.ts`
- [ ] T014 [P] Setup Zustand store infrastructure in `src/stores/` with base store pattern
- [ ] T015 Implement order status enum and validation utilities in `src/types/order-status.ts` per data-model.md transitions

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Cart to Order Pipeline (Priority: P1) 🎯 MVP

**Goal**: Customer adds items to cart, completes checkout, order is created on backend before payment confirmation and persists even if payment fails.

**Independent Test**: Can be fully tested by adding items to cart, completing checkout flow, and verifying an order record exists in the system.

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement Order model/entity in `server/src/models/order.ts` per data-model.md schema
- [ ] T017 [P] [US1] Implement OrderItem model in `server/src/models/order-item.ts` per data-model.md schema
- [ ] T018 [US1] Implement orderService.createOrder() in `server/src/services/order.ts` per contracts/order-service.md (creates pending order, validates inventory, applies discount)
- [ ] T019 [US1] Implement orderService.getOrder() in `server/src/services/order.ts` per contracts/order-service.md
- [ ] T020 [US1] Implement orderService.updateOrder() in `server/src/services/order.ts` per contracts/order-service.md
- [ ] T021 [US1] Implement orderService.getOrderByNumber() in `server/src/services/order.ts` per contracts/order-service.md
- [ ] T022 [US1] Implement orderService.updateOrderStatus() in `server/src/services/order.ts` per contracts/order-service.md with status transition validation
- [ ] T023 [US1] Create POST /orders endpoint in `server/src/routes/orders.ts` calling orderService.createOrder()
- [ ] T024 [US1] Create GET /orders/:orderId endpoint in `server/src/routes/orders.ts` calling orderService.getOrder()
- [ ] T025 [US1] Create GET /orders/track endpoint in `server/src/routes/orders.ts` calling orderService.getOrderByNumber()
- [ ] T026 [US1] Create PATCH /orders/:orderId endpoint in `server/src/routes/orders.ts` calling orderService.updateOrder()
- [ ] T027 [US1] Create PATCH /orders/:orderId/status endpoint in `server/src/routes/orders.ts` calling orderService.updateOrderStatus()
- [ ] T028 [US1] Implement frontend order service API client in `src/services/order.ts` with all contract methods
- [ ] T029 [US1] Implement orderStore in `src/stores/orderStore.ts` using Zustand for order state management
- [ ] T030 [US1] Implement useOrder hook in `src/hooks/useOrder.ts` wrapping orderStore with React Query
- [ ] T031 [US1] Update checkout flow in existing `src/services/checkout.ts` to call orderService.createOrder() before payment
- [ ] T032 [US1] Add inventory validation at checkout completion in `server/src/services/order.ts` per research.md
- [ ] T033 [US1] Implement order locking mechanism in `server/src/services/order.ts` to prevent duplicate fulfillment per research.md
- [ ] T034 [US1] Add cart state preservation for abandonment recovery in `src/services/cart.ts`
- [ ] T035 [US1] Add validation and error handling for all order endpoints with proper error codes (INVENTORY_UNAVAILABLE, INVALID_DISCOUNT, INVALID_ADDRESS)
- [ ] T036 [US1] Add logging for order creation and checkout operations

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - cart to order creation works, order persists in database

---

## Phase 4: User Story 2 - Payment Success Creates Order (Priority: P1)

**Goal**: When payment succeeds, order transitions to confirmed status and customer receives confirmation email. When payment fails, order is marked as failed and customer is notified.

**Independent Test**: Can be tested by submitting payment and verifying order status reflects payment outcome.

### Implementation for User Story 2

- [ ] T037 [P] [US2] Implement payment webhook signature validation in `server/src/lib/stripe.ts`
- [ ] T038 [P] [US2] Implement email template for order confirmation in `server/src/templates/order-confirmation.ts`
- [ ] T039 [US2] Implement payment webhook handler in `server/src/routes/webhooks.ts` per contracts/payment-webhook.md (validates signature, looks up order, updates status, sends email)
- [ ] T040 [US2] Implement POST /webhooks/stripe endpoint in `server/src/routes/webhooks.ts` to receive Stripe webhooks
- [ ] T041 [US2] Implement payment_intent.succeeded handler in `server/src/services/order.ts` to transition order to confirmed and send confirmation email
- [ ] T042 [US2] Implement payment_intent.payment_failed handler in `server/src/services/order.ts` to transition order to payment_failed
- [ ] T043 [US2] Implement payment retry flow in `src/services/order.ts` frontend to update existing order instead of creating duplicate
- [ ] T044 [US2] Update orderStore to handle payment status transitions and notifications
- [ ] T045 [US2] Add payment failure notification UI in checkout flow
- [ ] T046 [US2] Add payment timeout handling mid-transaction per edge cases in spec.md
- [ ] T047 [US2] Add logging for webhook processing and email sending

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - full cart → order → payment → confirmation flow works

---

## Phase 5: User Story 3 - Guest Checkout and Order Tracking (Priority: P2)

**Goal**: Customer without account can complete checkout using email. After purchase, they can track order status using order number and email.

**Independent Test**: Can be tested by completing checkout as guest and using order tracking to view order status.

### Implementation for User Story 3

- [ ] T048 [P] [US3] Create OrderTracking page component in `src/pages/OrderTracking.tsx`
- [ ] T049 [P] [US3] Create order tracking form component in `src/components/OrderTrackingForm.tsx`
- [ ] T050 [P] [US3] Create order status display component in `src/components/OrderStatusDisplay.tsx`
- [ ] T051 [US3] Implement guest checkout flow in existing checkout pages to accept email without account creation
- [ ] T052 [US3] Wire order tracking page to useOrder hook and getOrderByNumber API
- [ ] T053 [US3] Add order tracking route in React Router configuration
- [ ] T054 [US3] Update order creation to support null customerId for guest orders per data-model.md
- [ ] T055 [US3] Add order number generation in orderService.createOrder() for customer-facing order ID
- [ ] T056 [US3] Add email confirmation sending for guest checkout orders
- [ ] T057 [US3] Add validation and error handling for order tracking (ORDER_NOT_FOUND)
- [ ] T058 [US3] Add logging for guest checkout and order tracking operations

**Checkpoint**: User Story 3 complete - guest checkout and order tracking work independently

---

## Phase 6: User Story 4 - Admin Order and Product Management (Priority: P2)

**Goal**: Store administrators can view and manage orders, update product inventory, and manage the product catalog.

**Independent Test**: Can be tested by admin logging in and performing product/inventory/order management actions.

### Implementation for User Story 4

- [ ] T059 [P] [US4] Create admin orders list page in `src/pages/AdminOrders.tsx`
- [ ] T060 [P] [US4] Create admin order detail page in `src/pages/AdminOrderDetail.tsx`
- [ ] T061 [P] [US4] Create admin product management page in `src/pages/AdminProducts.tsx`
- [ ] T062 [P] [US4] Create admin inventory update component in `src/components/AdminInventoryUpdate.tsx`
- [ ] T063 [US4] Implement GET /admin/orders endpoint in `server/src/routes/orders.ts` with search and filtering
- [ ] T064 [US4] Implement PATCH /admin/orders/:orderId/status endpoint in `server/src/routes/orders.ts` for admin status updates
- [ ] T065 [US4] Implement GET /admin/products endpoint in `server/src/routes/products.ts`
- [ ] T066 [US4] Implement PATCH /admin/products/:productId/inventory endpoint in `server/src/routes/products.ts`
- [ ] T067 [US4] Implement admin order management API calls in `src/services/order.ts`
- [ ] T068 [US4] Implement admin product management API calls in `src/services/products.ts`
- [ ] T069 [US4] Add admin authentication middleware to admin routes per plan.md assumption
- [ ] T070 [US4] Wire admin pages to API endpoints with React Query
- [ ] T071 [US4] Add order status update UI with valid transition enforcement per data-model.md
- [ ] T072 [US4] Add inventory update UI with quantity validation
- [ ] T073 [US4] Add admin route protection in React Router
- [ ] T074 [US4] Add logging for admin operations

**Checkpoint**: User Story 4 complete - admin can manage orders, products, and inventory independently

---

## Phase 7: User Story 5 - Discounts and Pricing Engine (Priority: P3)

**Goal**: Customers can apply promotional codes at checkout and see discounted pricing. Shipping costs are calculated based on shipping method and address.

**Independent Test**: Can be tested by applying a discount code and verifying correct total calculation.

### Implementation for User Story 5

- [ ] T075 [P] [US5] Implement Discount model in `server/src/models/discount.ts` per data-model.md
- [ ] T076 [P] [US5] Create shipping calculation service in `server/src/services/shipping.ts`
- [ ] T077 [US5] Create discount validation and application service in `server/src/services/discount.ts`
- [ ] T078 [US5] Implement POST /discounts/validate endpoint in `server/src/routes/discounts.ts`
- [ ] T079 [US5] Implement GET /shipping/rates endpoint in `server/src/routes/shipping.ts`
- [ ] T080 [US5] Add discount code input and validation UI in checkout flow
- [ ] T081 [US5] Add shipping method selection and cost display in checkout flow
- [ ] T082 [US5] Update order total calculation in orderService.createOrder() to include discounts and shipping
- [ ] T083 [US5] Add discount code application in cartStore for preview before checkout
- [ ] T084 [US5] Add discount expiration handling per edge cases in spec.md
- [ ] T085 [US5] Add shipping address validation per data-model.md rules
- [ ] T086 [US5] Add logging for discount application and shipping calculation

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: E2E Tests

**Purpose**: End-to-end tests for critical commerce flows per spec.md testing requirements

- [ ] T087 [P] Implement cart to order completion E2E test in `tests/e2e/checkout.spec.ts`
- [ ] T088 [P] Implement payment success/failure E2E test in `tests/e2e/payment.spec.ts`
- [ ] T089 [P] Implement guest checkout and order tracking E2E test in `tests/e2e/guest-checkout.spec.ts`
- [ ] T090 [P] Implement admin order management E2E test in `tests/e2e/admin-orders.spec.ts`
- [ ] T091 [P] Implement discount application E2E test in `tests/e2e/discounts.spec.ts`
- [ ] T092 Implement cart abandonment and recovery E2E test in `tests/e2e/cart-abandonment.spec.ts`
- [ ] T093 Implement concurrent checkout handling E2E test in `tests/e2e/concurrent-checkout.spec.ts`

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T094 [P] Handle edge case: cart item goes out of stock during checkout in `server/src/services/order.ts`
- [ ] T095 [P] Handle edge case: duplicate order submissions with idempotency key in `server/src/routes/orders.ts`
- [ ] T096 [P] Handle edge case: two customers checkout with same item simultaneously via order locking
- [ ] T097 [P] Documentation updates in `docs/` for API endpoints and data model
- [ ] T098 Performance optimization: add Redis caching for cart sessions per plan.md (or ensure localStorage fallback works)
- [ ] T099 Performance optimization: ensure <200ms p95 for cart operations
- [ ] T100 Security hardening: validate all webhook signatures, sanitize inputs, add rate limiting
- [ ] T101 Code cleanup and refactoring across all services
- [ ] T102 Run quickstart.md validation: test full checkout flow per quickstart.md testing scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **E2E Tests (Phase 8)**: Depends on all user stories being complete
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 (payment webhooks update orders created by US1)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 (guest checkout uses order creation)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1/US2 (admin manages orders created by US1/US2)
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1 (discounts applied during order creation)

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All E2E tests marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Implement Order model/entity in server/src/models/order.ts"
Task: "Implement OrderItem model in server/src/models/order-item.ts"

# Launch all order service methods together (after models):
Task: "Implement orderService.createOrder() in server/src/services/order.ts"
Task: "Implement orderService.getOrder() in server/src/services/order.ts"
Task: "Implement orderService.updateOrder() in server/src/services/order.ts"
Task: "Implement orderService.getOrderByNumber() in server/src/services/order.ts"
Task: "Implement orderService.updateOrderStatus() in server/src/services/order.ts"

# Launch all order endpoints together (after service methods):
Task: "Create POST /orders endpoint in server/src/routes/orders.ts"
Task: "Create GET /orders/:orderId endpoint in server/src/routes/orders.ts"
Task: "Create GET /orders/track endpoint in server/src/routes/orders.ts"
Task: "Create PATCH /orders/:orderId endpoint in server/src/routes/orders.ts"
Task: "Create PATCH /orders/:orderId/status endpoint in server/src/routes/orders.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test cart → order creation flow independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (full payment flow)
4. Add User Story 3 → Test independently → Deploy/Demo (guest checkout)
5. Add User Story 4 → Test independently → Deploy/Demo (admin operations)
6. Add User Story 5 → Test independently → Deploy/Demo (discounts/shipping)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + User Story 2 (core commerce flow)
   - Developer B: User Story 3 (guest checkout)
   - Developer C: User Story 4 (admin management)
   - Developer D: User Story 5 (discounts/shipping)
3. Stories complete and integrate independently
4. Team collaborates on E2E tests and Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
