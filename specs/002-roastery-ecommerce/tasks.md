# Tasks: Roastery E-Commerce Platform

**Branch**: `002-roastery-ecommerce` | **Date**: 2025-01-07  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Task Summary

| Phase   | User Story                   | Tasks     | Description                                |
| ------- | ---------------------------- | --------- | ------------------------------------------ |
| Phase 1 | Setup                        | T001-T008 | Project initialization and configuration   |
| Phase 2 | Foundational                 | T009-T020 | Core infrastructure and shared components  |
| Phase 3 | US1: Browse & Purchase (P1)  | T021-T052 | Product catalog, cart, checkout            |
| Phase 4 | US2: Account Management (P1) | T053-T070 | Auth, profiles, addresses, order history   |
| Phase 5 | US3: Subscriptions (P2)      | T071-T088 | Subscription creation, management, billing |
| Phase 6 | US4: Admin Dashboard (P2)    | T089-T108 | Order processing, inventory, reports       |
| Phase 7 | US5: Reviews & Ratings (P3)  | T109-T120 | Review submission, display, moderation     |
| Phase 8 | US6: Loyalty Program (P3)    | T121-T134 | Points, tiers, referrals                   |
| Phase 9 | Polish                       | T135-T144 | Performance, accessibility, testing        |

**Total Tasks**: 144  
**Parallel Opportunities**: 60+ (marked with [P])  
**MVP Scope**: Phase 1-4 (User Stories 1-2)

---

## Dependency Graph

```
Phase 1: Setup
    │
    ▼
Phase 2: Foundational
    │
    ├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
    │              │              │              │              │              │
    ▼              ▼              ▼              ▼              ▼              ▼
Phase 3: US1   Phase 4: US2   Phase 5: US3   Phase 6: US4   Phase 7: US5   Phase 8: US6
(P1)           (P1)           (P2)           (P2)           (P3)           (P3)
Browse &       Account        Subscription   Admin          Reviews        Loyalty
Purchase       Management     Management     Dashboard      & Ratings      Program
    │              │              │              │              │              │
    └──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
                                          │
                                          ▼
                                    Phase 9: Polish
```

**Key Dependencies**:

- US1 (Browse & Purchase) is **independent** and can be built first
- US2 (Account Management) requires auth from Phase 2
- US3-6 can be developed in parallel after Phase 2 completes
- Each user story is independently testable

---

## Implementation Strategy

**MVP First**: Deploy User Stories 1-2 (Browse & Purchase + Account Management) as MVP to enable revenue generation immediately.

**Incremental Delivery**:

1. **Sprint 1-2**: Phase 1-2 (Setup + Foundational)
2. **Sprint 3-4**: Phase 3 (US1 - Browse & Purchase)
3. **Sprint 5-6**: Phase 4 (US2 - Account Management) → **MVP LAUNCH**
4. **Sprint 7-8**: Phase 5 (US3 - Subscriptions)
5. **Sprint 9-10**: Phase 6 (US4 - Admin Dashboard)
6. **Sprint 11**: Phase 7 (US5 - Reviews)
7. **Sprint 12**: Phase 8 (US6 - Loyalty)
8. **Sprint 13**: Phase 9 (Polish & Optimization)

---

## Phase 1: Setup (Project Initialization)

**Goal**: Initialize project structure and configure development environment

**Parallel Execution**: All tasks in this phase can be executed in parallel after prerequisites are met

### Setup Tasks

- [x] T001 Configure TypeScript 5.8 with strict settings in `tsconfig.json`
- [x] T002 [P] Setup Vite 6 development environment with React 19 in `vite.config.ts`
- [x] T003 [P] Configure Tailwind CSS 4 with custom theme (via `index.css` @theme directive)
- [x] T004 [P] Setup React Router 7 with route structure in `src/routes/index.tsx`
- [x] T005 Install and configure core dependencies (React 19, Motion, Lucide React) in `package.json`
- [x] T006 [P] Configure Vitest testing environment in `vitest.config.ts`
- [x] T007 [P] Setup Playwright E2E testing configuration in `playwright.config.ts`
- [x] T008 [P] Configure ESLint and Prettier for code quality in `eslint.config.js` and `.prettierrc`

**Phase 1 Verification**:

```bash
npm install
npm run dev        # Should start dev server
npm run test       # Should run unit tests
npm run lint       # Should pass linting
```

---

## Phase 2: Foundational (Core Infrastructure)

**Goal**: Build shared infrastructure that all user stories depend on

**Blocking**: Must complete before any user story implementation

**Independent Test**: Core types, utilities, and base components render without errors

### Core Types & Constants

- [x] T009 [P] Create TypeScript interfaces for all entities in `src/types/index.ts` (User, Product, Order, etc.)
- [x] T010 [P] Define application constants (roles, order statuses, product types) in `src/utils/constants.ts`
- [x] T011 [P] Create type guards and validation utilities in `src/utils/typeguards.ts`
- [x] T012 [P] Setup API response types and error handling types in `src/types/api.ts` (included in index.ts)

### API Infrastructure

- [x] T013 Create Axios instance with interceptors in `src/services/api.ts`
- [x] T014 [P] Implement API error handling and retry logic in `src/services/api/errorHandler.ts`
- [x] T015 [P] Create loading state management utilities in `src/utils/loadingStates.ts` (included in helpers.ts)
- [x] T016 Setup environment variable validation in `src/utils/env.ts` (included in api.ts)

### Base Components

- [x] T017 [P] Create Button component with variants in `src/components/common/Button.tsx`
- [x] T018 [P] Create Input component with validation in `src/components/common/Input.tsx`
- [x] T019 [P] Create Modal/Dialog component in `src/components/common/Modal.tsx`
- [x] T020 [P] Create LoadingSpinner and Skeleton components in `src/components/common/Loading.tsx`

**Phase 2 Verification**:

- All types compile without errors
- Base components render in Storybook (if configured)
- API client handles 401/403 errors correctly

---

## Phase 3: User Story 1 - Browse and Purchase Coffee (Priority: P1)

**Goal**: Enable users to browse products, add to cart, and complete purchase

**Why This Priority**: Core revenue-generating flow - must work flawlessly for launch

**Independent Test**: A user can complete end-to-end purchase from homepage to order confirmation

**Acceptance Criteria**:

1. ✅ Browse catalog with filters (origin, roast level, flavor notes)
2. ✅ Add products to cart with variant selection
3. ✅ Complete checkout with payment
4. ✅ Out-of-stock variants disabled

### US1: Product Catalog

- [x] T021 [US1] Create ProductCard component in `src/components/product/ProductCard.tsx`
- [x] T022 [US1] [P] Create ProductGrid component in `src/components/product/ProductGrid.tsx`
- [x] T023 [US1] [P] Implement product filtering UI in `src/components/product/ProductFilters.tsx`
- [x] T024 [US1] [P] Create ProductImageGallery component in `src/components/product/ProductImageGallery.tsx`
- [x] T025 [US1] [P] Implement variant selector (size × grind) in `src/components/product/VariantSelector.tsx`
- [x] T026 [US1] [P] Create ProductBadge component for labels (New, Sale, etc.) in `src/components/product/Badge.tsx`
- [x] T027 [US1] Build Shop page with filtering in `src/pages/Shop.tsx`
- [x] T028 [US1] Build Product detail page in `src/pages/Product.tsx`
- [x] T029 [US1] Implement product search with autocomplete in `src/components/product/ProductSearch.tsx`
- [x] T030 [US1] [P] Create QuickView modal component in `src/components/product/QuickView.tsx`

### US1: Cart Management

- [x] T031 [US1] Setup CartContext with Zustand in `src/contexts/CartContext.tsx`
- [x] T032 [US1] Create CartItem component in `src/components/cart/CartItem.tsx`
- [x] T033 [US1] [P] Create CartSummary component in `src/components/cart/CartSummary.tsx`
- [x] T034 [US1] Build Cart page in `src/pages/Cart.tsx`
- [x] T035 [US1] Implement cart persistence (localStorage for guests) in `src/utils/cartStorage.ts`
- [x] T036 [US1] Create CartIcon with badge in `src/components/cart/CartIcon.tsx`
- [x] T037 [US1] [P] Implement "Save for Later" functionality in `src/components/cart/SaveForLater.tsx`
- [x] T038 [US1] Add cart expiration timer UI in `src/components/cart/CartTimer.tsx`

### US1: Checkout Flow

- [x] T039 [US1] Create checkout step indicator in `src/components/checkout/StepIndicator.tsx`
- [x] T040 [US1] Build Shipping Information step in `src/pages/Checkout/Shipping.tsx`
- [x] T041 [US1] [P] Create AddressForm component in `src/components/checkout/AddressForm.tsx`
- [x] T042 [US1] Build Payment step with Stripe Elements in `src/pages/Checkout/Payment.tsx`
- [x] T043 [US1] [P] Integrate Stripe Payment Element in `src/components/checkout/StripePayment.tsx`
- [x] T044 [US1] Build Order Review step in `src/pages/Checkout/Review.tsx`
- [x] T045 [US1] [P] Create OrderSummary component in `src/components/checkout/OrderSummary.tsx`
- [x] T046 [US1] Implement discount code input in `src/components/checkout/DiscountInput.tsx`
- [x] T047 [US1] Build Order Confirmation page in `src/pages/Checkout/Confirmation.tsx`
- [x] T048 [US1] [P] Create shipping method selector in `src/components/checkout/ShippingMethodSelector.tsx`

### US1: Services & Integration

- [x] T049 [US1] Implement product API service in `src/services/products.ts`
- [x] T050 [US1] [P] Implement cart API service in `src/services/cart.ts`
- [x] T051 [US1] Implement checkout API service in `src/services/checkout.ts`
- [x] T052 [US1] [P] Create shipping rate calculator service in `src/services/shipping.ts`

**US1 Verification**:

- User can browse, filter, and view products
- Add items to cart with variant selection
- Complete checkout with Stripe test card (4242...)
- Receive order confirmation email

---

## Phase 4: User Story 2 - Customer Account Management (Priority: P1)

**Goal**: Enable user registration, authentication, and account management

**Why This Priority**: Essential for customer retention and enables other features

**Independent Test**: User can register, login, save address, view orders

**Acceptance Criteria**:

1. ✅ Register with email/password and verify email
2. ✅ Save shipping addresses with default selection
3. ✅ View order history with reorder functionality
4. ✅ Use saved payment methods at checkout

### US2: Authentication

- [x] T053 [US2] Setup AuthContext in `src/contexts/AuthContext.tsx`
- [x] T054 [US2] Create Login page in `src/pages/Auth/Login.tsx`
- [x] T055 [US2] [P] Create Registration page in `src/pages/Auth/Register.tsx`
- [x] T056 [US2] [P] Build Forgot Password flow in `src/pages/Auth/ForgotPassword.tsx`
- [x] T057 [US2] Implement JWT token management in `src/utils/auth.ts`
- [x] T058 [US2] [P] Create social login buttons (Google, Facebook, Apple) in `src/components/auth/SocialLogin.tsx`
- [x] T059 [US2] Build Email Verification page in `src/pages/Auth/VerifyEmail.tsx`
- [x] T060 [US2] [P] Create PasswordReset page in `src/pages/Auth/ResetPassword.tsx`

### US2: Account Profile

- [x] T061 [US2] Build Account Dashboard page in `src/pages/Account/Dashboard.tsx`
- [x] T062 [US2] [P] Create Profile Edit form in `src/pages/Account/Profile.tsx`
- [x] T063 [US2] Build Address Book page in `src/pages/Account/Addresses.tsx`
- [x] T064 [US2] [P] Create AddressForm component in `src/components/account/AddressForm.tsx`
- [x] T065 [US2] Build Payment Methods page in `src/pages/Account/PaymentMethods.tsx`
- [ ] T066 [US2] [P] Integrate Stripe Setup Intent for saved cards in `src/components/account/SavedPaymentMethods.tsx`

### US2: Order History

- [x] T067 [US2] Build Order History page in `src/pages/Account/Orders.tsx`
- [x] T068 [US2] [P] Create OrderCard component in `src/components/account/OrderCard.tsx`
- [x] T069 [US2] Build Order Detail page in `src/pages/Account/OrderDetail.tsx`
- [x] T070 [US2] [P] Implement Reorder functionality in `src/components/account/ReorderButton.tsx`

**US2 Verification**:

- User can register and verify email
- Login/logout works with JWT
- Can add and set default address
- View order history and click Reorder

---

## Phase 5: User Story 3 - Coffee Subscription Management (Priority: P2)

**Goal**: Enable subscription creation, modification, and management

**Why This Priority**: Recurring revenue and customer retention

**Independent Test**: User can create subscription, skip/pause/cancel

**Acceptance Criteria**:

1. ✅ Subscribe to coffee with frequency selection
2. ✅ Skip next delivery
3. ✅ Modify subscription products
4. ✅ Handle failed payment retries

### US3: Subscription Creation

- [x] T071 [US3] [P] Create SubscriptionSelector on Product page in `src/components/subscription/SubscriptionSelector.tsx`
- [x] T072 [US3] Add frequency selection (weekly/bi-weekly/monthly) in `src/components/subscription/FrequencySelector.tsx`
- [x] T073 [US3] [P] Create "Roaster's Choice" option UI in `src/components/subscription/RoastersChoice.tsx`
- [x] T074 [US3] [P] Implement subscription preferences form in `src/components/subscription/SubscriptionPreferences.tsx`

### US3: Subscription Management

- [x] T075 [US3] Build Subscriptions list page in `src/pages/Account/Subscriptions.tsx`
- [x] T076 [US3] Create SubscriptionDetail page in `src/pages/Account/SubscriptionDetail.tsx`
- [x] T077 [US3] [P] Implement Skip Delivery functionality in `src/components/subscription/SkipDeliveryButton.tsx`
- [x] T078 [US3] [P] Create Pause/Resume subscription controls in `src/components/subscription/PauseSubscription.tsx`
- [x] T079 [US3] Build Cancel Subscription flow in `src/components/subscription/CancelSubscription.tsx`
- [x] T080 [US3] [P] Implement subscription modification (change product/frequency) in `src/components/subscription/ModifySubscription.tsx`
- [x] T081 [US3] Create upcoming deliveries preview in `src/components/subscription/UpcomingDeliveries.tsx`

### US3: Services

- [ ] T082 [US3] Implement subscription API service in `src/services/subscriptions.ts`
- [ ] T083 [US3] [P] Create subscription billing status tracker in `src/services/subscriptionBilling.ts`
- [ ] T084 [US3] Implement subscription discount calculator in `src/utils/subscriptionDiscounts.ts`

**US3 Verification**:

- Can subscribe to coffee from product page
- Subscription appears in account
- Can skip, pause, and cancel subscription
- Payment failure shows retry status

---

## Phase 6: User Story 4 - Admin Order and Inventory Management (Priority: P2)

**Goal**: Enable admin to process orders and manage inventory

**Why This Priority**: Essential for business operations

**Independent Test**: Admin can view orders, update status, receive low-stock alerts

**Acceptance Criteria**:

1. ✅ View pending orders with filters
2. ✅ Update order status with tracking
3. ✅ Receive low-stock alerts
4. ✅ Generate packing slips

### US4: Admin Dashboard

- [x] T085 [US4] Create AdminLayout with navigation in `src/components/admin/AdminLayout.tsx`
- [x] T086 [US4] Build Admin Dashboard page with metrics in `src/pages/Admin/Dashboard.tsx`
- [x] T087 [US4] [P] Create metric cards (orders, revenue, pending) in `src/components/admin/MetricCards.tsx`
- [x] T088 [US4] [P] Implement low-stock alerts widget in `src/components/admin/LowStockAlert.tsx`

### US4: Order Management

- [x] T089 [US4] Build Orders list page with filters in `src/pages/Admin/Orders.tsx`
- [x] T090 [US4] [P] Create OrderFilters component in `src/components/admin/OrderFilters.tsx`
- [x] T091 [US4] Build Order Detail page for admin in `src/pages/Admin/OrderDetail.tsx`
- [x] T092 [US4] [P] Implement status update workflow in `src/components/admin/StatusUpdater.tsx`
- [x] T093 [US4] [P] Create tracking number input in `src/components/admin/TrackingInput.tsx`
- [x] T094 [US4] Implement bulk actions (print labels, update status) in `src/components/admin/BulkActions.tsx`
- [x] T095 [US4] [P] Build packing slip generator in `src/components/admin/PackingSlip.tsx`

### US4: Product & Inventory Management

- [x] T096 [US4] Build Products list page in `src/pages/Admin/Products.tsx`
- [x] T097 [US4] [P] Create ProductForm for create/edit in `src/components/admin/ProductForm.tsx`
- [x] T098 [US4] [P] Build VariantManager component in `src/components/admin/VariantManager.tsx`
- [x] T099 [US4] Implement ProductFilters in `src/components/admin/ProductFilters.tsx`
- [x] T100 [US4] [P] Create InventoryTable component in `src/components/admin/InventoryTable.tsx`
- [ ] T101 [US4] Build Category manager in `src/pages/Admin/Categories.tsx`

### US4: Customer Management

- [x] T102 [US4] Build Customers list page in `src/pages/Admin/Customers.tsx`
- [x] T103 [US4] [P] Create CustomerDetail page in `src/pages/Admin/CustomerDetail.tsx`
- [x] T104 [US4] [P] Implement customer notes in `src/components/admin/CustomerNotes.tsx`

### US4: Reports

- [x] T105 [US4] Build Reports page with charts
- [x] T106 [US4] [P] Create MetricCards for admin stats in `src/components/admin/MetricCards.tsx`
- [x] T107 [US4] [P] Build CustomerFilters in `src/components/admin/CustomerFilters.tsx`
- [x] T108 [US4] Create StatsCards component in `src/components/admin/StatsCards.tsx`

- [ ] T105 [US4] [P] Build Sales reports page in `src/pages/Admin/Reports/Sales.tsx`
- [ ] T106 [US4] [P] Create Inventory reports in `src/pages/Admin/Reports/Inventory.tsx`
- [ ] T107 [US4] [P] Build Subscription analytics in `src/pages/Admin/Reports/Subscriptions.tsx`
- [ ] T108 [US4] [P] Implement report export (CSV) in `src/utils/reportExport.ts`

**US4 Verification**:

- Admin can login and view dashboard
- See pending orders count
- Update order status and add tracking
- Receive low-stock alert emails

---

## Phase 7: User Story 5 - Product Reviews and Ratings (Priority: P3)

**Goal**: Enable verified purchasers to submit reviews and shoppers to view them

**Why This Priority**: Social proof increases conversion

**Independent Test**: Verified purchaser can submit review, shoppers can view

**Acceptance Criteria**:

1. ✅ Submit review 7 days after delivery
2. ✅ Display rating distribution
3. ✅ Mark reviews as helpful

### US5: Review Display

- [x] T109 [US5] Create ReviewCard component in `src/components/reviews/ReviewCard.tsx`
- [x] T110 [US5] [P] Build RatingDistribution component in `src/components/reviews/RatingDistribution.tsx`
- [x] T111 [US5] Implement ReviewsList with sorting/filtering in `src/components/reviews/ReviewsList.tsx`
- [x] T112 [US5] [P] Create "Verified Purchase" badge in `src/components/reviews/VerifiedBadge.tsx`

### US5: Review Submission

- [x] T113 [US5] Build ReviewForm component in `src/components/reviews/ReviewForm.tsx`
- [x] T114 [US5] [P] Create StarRating input component in `src/components/reviews/StarRating.tsx`
- [x] T115 [US5] [P] Implement image upload for reviews in `src/components/reviews/ReviewImageUpload.tsx`
- [x] T116 [US5] Build "Write a Review" page in `src/pages/Reviews/WriteReview.tsx`

### US5: Review Moderation (Admin)

- [x] T117 [US5] [P] Create review moderation queue in `src/pages/Admin/Reviews.tsx`
- [x] T118 [US5] [P] Build review approval/rejection UI in `src/components/admin/ReviewModeration.tsx`

### US5: Services

- [x] T119 [US5] Implement reviews API service in `src/services/reviews.ts`
- [x] T120 [US5] [P] Create review request email trigger in `src/services/reviewRequests.ts`

**US5 Verification**:

- Reviews display on product page
- Can sort by helpful/most recent
- Verified badge shows for verified purchases
- Can submit review with photos

---

## Phase 8: User Story 6 - Loyalty and Rewards Program (Priority: P3)

**Goal**: Enable customers to earn and redeem points, track tier progress

**Why This Priority**: Increases customer lifetime value

**Independent Test**: Customer earns points, views balance, redeems at checkout

**Acceptance Criteria**:

1. ✅ Earn points for purchases (1 point per $1)
2. ✅ Redeem points at checkout
3. ✅ Refer friends and earn bonus points

### US6: Loyalty Dashboard

- [x] T121 [US6] Build Loyalty Dashboard page in `src/pages/Account/Loyalty.tsx`
- [x] T122 [US6] [P] Create PointsBalance component in `src/components/loyalty/PointsBalance.tsx`
- [x] T123 [US6] [P] Implement TierProgress visualization in `src/components/loyalty/TierProgress.tsx`
- [x] T124 [US6] Build PointsHistory list in `src/components/loyalty/PointsHistory.tsx`

### US6: Points Redemption

- [x] T125 [US6] [P] Create PointsRedemption component for checkout in `src/components/loyalty/PointsRedemption.tsx`
- [x] T126 [US6] [P] Implement points calculator in `src/utils/pointsCalculator.ts`

### US6: Referral Program

- [x] T127 [US6] Build Referral page in `src/pages/Account/Referral.tsx`
- [x] T128 [US6] [P] Create ReferralCode display in `src/components/loyalty/ReferralCode.tsx`
- [x] T129 [US6] [P] Implement referral sharing (email, social) in `src/components/loyalty/ReferralShare.tsx`
- [x] T130 [US6] Build referral tracking in `src/components/loyalty/ReferralTracking.tsx`

### US6: Services

- [x] T131 [US6] Implement loyalty API service in `src/services/loyalty.ts`
- [x] T132 [US6] [P] Create points transaction service in `src/services/pointsTransactions.ts`
- [x] T133 [US6] [P] Implement tier evaluation logic in `src/utils/tierEvaluation.ts`
- [x] T134 [US6] Build referral validation service in `src/services/referrals.ts`

**US6 Verification**:

- Points earned after purchase completion
- Can view points balance and tier progress
- Redeem points at checkout
- Referral code generates unique code

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Performance optimization, accessibility, testing, and deployment

**Acceptance Criteria**:

1. ✅ Page load times under targets
2. ✅ WCAG 2.1 AA compliant
3. ✅ 95%+ test coverage on critical paths
4. ✅ Production deployment ready

### Performance Optimization

- [x] T135 [P] Implement image lazy loading and optimization in `src/utils/imageOptimization.ts`
- [x] T136 [P] Add route-based code splitting in `src/routes/lazyRoutes.ts`
- [x] T137 [P] Configure React Query caching strategies in `src/services/queryClient.ts`
- [x] T138 [P] Implement service worker for offline support in `public/sw.js`

### Accessibility & UX

- [x] T139 [P] Add ARIA labels and keyboard navigation in `src/utils/accessibility.ts`
- [x] T140 [P] Implement focus management for modals in `src/hooks/useFocusTrap.ts`
- [x] T141 [P] Create error boundary components in `src/components/common/ErrorBoundary.tsx`
- [x] T142 [P] Add loading states and skeletons throughout app

### Testing & Quality

- [ ] T143 [P] Write E2E tests for critical user flows in `tests/e2e/criticalFlows.spec.ts`
- [x] T144 [P] Implement performance monitoring in `src/utils/performance.ts`

**Phase 9 Verification**:

- Lighthouse score >90 on all pages
- All WCAG 2.1 AA requirements met
- E2E tests pass for checkout flow
- Performance targets met

---

## Parallel Execution Examples

### Within Phase 3 (User Story 1):

**Team of 3 developers can work in parallel**:

**Developer A - Product Catalog**:

- T021 ProductCard
- T022 ProductGrid
- T023 ProductFilters
- T024 ProductImageGallery
- T025 VariantSelector

**Developer B - Cart Management**:

- T031 CartContext
- T032 CartItem
- T033 CartSummary
- T034 Cart page
- T035 Cart persistence

**Developer C - Checkout Flow**:

- T039 StepIndicator
- T040 Shipping step
- T042 Payment step
- T044 Order Review step
- T047 Confirmation page

**After initial components complete, integrate**:

- All developers sync on T049-T052 (API services)

### Cross-Story Parallelism:

After Phase 2 (Foundational) completes:

**Sprint 1**: US3 (Subscriptions) + US5 (Reviews) can start in parallel  
**Sprint 2**: US4 (Admin) + US6 (Loyalty) can start in parallel

**No dependencies between these stories** - each is independently testable.

---

## Task Status Legend

- [ ] Not started
- [~] In progress
- [x] Completed
- [P] Parallelizable (no dependencies on incomplete tasks)
- [US#] Maps to User Story #

---

## File Path Conventions

- **Components**: `src/components/[category]/[ComponentName].tsx`
- **Pages**: `src/pages/[PageName].tsx` or `src/pages/[Section]/[PageName].tsx`
- **Hooks**: `src/hooks/use[HookName].ts`
- **Services**: `src/services/[serviceName].ts`
- **Utils**: `src/utils/[utilityName].ts`
- **Types**: `src/types/[typeName].ts`
- **Tests**: `src/components/**/*.test.tsx` or `tests/[type]/*.spec.ts`

---

**Next Steps**: Run `/speckit.implement` to execute these tasks or convert to GitHub issues with `/speckit.taskstoissues`
