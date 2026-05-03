# Quickstart: Roastery E-Commerce Platform

**Date**: 2025-01-07  
**Feature**: Roastery E-Commerce Platform

---

## Development Setup

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Git**: For version control
- **PostgreSQL**: 15.x (for local backend development)
- **Redis**: 7.x (for sessions/caching)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd doha-Roastery-store-

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values:
# - Database connection strings
# - API keys (Stripe, PayPal, etc.)
# - Email service credentials
```

**Required Environment Variables**:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/roastery

# Redis
REDIS_URL=redis://localhost:6379

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=another-secret-key

# Session
SESSION_SECRET=session-secret-key
```

### 3. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed initial data (products, admin user)
npm run db:seed
```

### 4. Start Development Server

```bash
# Start frontend dev server
npm run dev

# In another terminal, start backend (if separate)
npm run dev:api

# Access the application
open http://localhost:5173
```

---

## Project Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── common/         # Buttons, inputs, modals
│   ├── product/        # Product cards, galleries
│   ├── cart/           # Cart components
│   └── admin/          # Admin dashboard widgets
├── pages/              # Route-level components
│   ├── Home.tsx
│   ├── Shop.tsx
│   ├── Product.tsx
│   ├── Cart.tsx
│   ├── Checkout/
│   │   ├── Shipping.tsx
│   │   ├── Payment.tsx
│   │   └── Review.tsx
│   ├── Account/
│   │   ├── Profile.tsx
│   │   ├── Orders.tsx
│   │   └── Subscriptions.tsx
│   └── Admin/
│       ├── Dashboard.tsx
│       ├── Products.tsx
│       └── Orders.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProducts.ts
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── ThemeContext.tsx
├── services/           # API integration
│   ├── api.ts          # Axios instance
│   ├── auth.ts
│   ├── products.ts
│   ├── cart.ts
│   └── orders.ts
├── types/              # TypeScript interfaces
│   ├── user.ts
│   ├── product.ts
│   ├── cart.ts
│   └── order.ts
└── utils/              # Helper functions
    ├── formatters.ts
    ├── validators.ts
    └── constants.ts
```

---

## Development Workflow

### Running Tests

```bash
# Unit tests (Vitest)
npm run test

# Unit tests with coverage
npm run test:coverage

# E2E tests (Playwright)
npm run test:e2e

# E2E tests in UI mode
npm run test:e2e:ui
```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

### Building for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

---

## Common Development Tasks

### Adding a New Product

1. **Via Admin Dashboard**:
   - Login as admin
   - Navigate to Products → Add New
   - Fill in details, upload images
   - Set variants (size × grind)
   - Set inventory levels
   - Publish

2. **Via Database Seed**:
   ```typescript
   // seeds/products.ts
   await createProduct({
     name: 'Ethiopia Yirgacheffe',
     sku: 'COF-ETH-001',
     basePrice: 1800,
     variants: [
       { size: '250g', grind: 'whole_bean', priceAdjustment: 0 },
       { size: '500g', grind: 'whole_bean', priceAdjustment: 1400 },
     ]
   });
   ```

### Testing Checkout Flow

1. **Stripe Test Mode**:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

2. **Test Scenarios**:
   - Successful payment
   - Declined card: `4000 0000 0000 0002`
   - 3D Secure required: `4000 0025 0000 3155`

### Debugging Webhooks

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/webhooks/stripe
```

---

## Key Features Implementation Guide

### 1. Product Catalog

**File**: `src/pages/Shop.tsx`

```typescript
// Fetch products with filters
const { data: products } = useProducts({
  filters: {
    type: 'coffee',
    origin: 'ethiopia',
    roast_level: 'light'
  },
  sort: 'price_asc'
});

// Display product grid
<ProductGrid products={products} />
```

### 2. Shopping Cart

**File**: `src/hooks/useCart.ts`

```typescript
const { cart, addItem, updateQuantity, removeItem } = useCart();

// Add to cart
addItem({
  variantId: 'uuid',
  quantity: 2
});

// Cart is automatically persisted (localStorage for guests, DB for auth)
```

### 3. Checkout Process

**Files**: `src/pages/Checkout/*.tsx`

Multi-step checkout flow:
1. **Shipping**: Collect address, select shipping method
2. **Payment**: Stripe Elements integration
3. **Review**: Order summary, confirm
4. **Confirmation**: Success page with order details

```typescript
// Initialize Stripe
const stripe = await loadStripe(process.env.STRIPE_PUBLIC_KEY);

// Create payment intent
const { clientSecret } = await api.post('/checkout', { ... });

// Confirm payment
const result = await stripe.confirmPayment({
  clientSecret,
  payment_method: { ... }
});
```

### 4. Subscription Management

**File**: `src/pages/Account/Subscriptions.tsx`

```typescript
// List subscriptions
const { data: subscriptions } = useSubscriptions();

// Skip next delivery
await api.post(`/subscriptions/${id}/skip`, { skipCount: 1 });

// Pause subscription
await api.post(`/subscriptions/${id}/pause`, { resumeDate: '2025-03-01' });
```

### 5. Admin Dashboard

**File**: `src/pages/Admin/Dashboard.tsx`

Key metrics displayed:
- Today's orders and revenue
- Pending orders count
- Low stock alerts
- Active subscriptions

**File**: `src/pages/Admin/Products.tsx`

Product management features:
- Create/edit products
- Manage variants and inventory
- Bulk operations (CSV import/export)
- Image uploads

---

## Testing Strategy

### Unit Tests

```typescript
// Example: Cart reducer test
import { cartReducer } from './cartReducer';

describe('cartReducer', () => {
  it('should add item to cart', () => {
    const state = { items: [] };
    const action = { type: 'ADD_ITEM', payload: { variantId: '123', quantity: 1 } };
    
    const newState = cartReducer(state, action);
    
    expect(newState.items).toHaveLength(1);
    expect(newState.items[0].variantId).toBe('123');
  });
});
```

### E2E Tests

```typescript
// Example: Checkout flow test
import { test, expect } from '@playwright/test';

test('completes checkout successfully', async ({ page }) => {
  // Add product to cart
  await page.goto('/shop/ethiopia-yirgacheffe');
  await page.selectOption('[name="grind"]', 'whole_bean');
  await page.selectOption('[name="size"]', '500g');
  await page.click('button:has-text("Add to Cart")');
  
  // Proceed to checkout
  await page.click('a:has-text("Checkout")');
  
  // Fill shipping info
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="address"]', '123 Main St');
  
  // Select shipping method
  await page.click('text=Standard Shipping');
  await page.click('button:has-text("Continue")');
  
  // Complete payment (Stripe test mode)
  await page.fill('[name="cardnumber"]', '4242424242424242');
  await page.fill('[name="exp-date"]', '12/25');
  await page.fill('[name="cvc"]', '123');
  
  // Confirm order
  await page.click('button:has-text("Place Order")');
  
  // Verify success
  await expect(page.locator('h1')).toContainText('Order Confirmed');
});
```

---

## Performance Optimization

### Frontend

1. **Code Splitting**:
   ```typescript
   const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
   ```

2. **Image Optimization**:
   ```typescript
   <img
     src={product.imageUrl}
     srcSet={`${product.thumbnail} 200w, ${product.medium} 600w, ${product.large} 1200w`}
     loading="lazy"
     alt={product.name}
   />
   ```

3. **Data Fetching**:
   ```typescript
   // Use React Query for caching
   const { data } = useQuery({
     queryKey: ['product', id],
     queryFn: () => fetchProduct(id),
     staleTime: 5 * 60 * 1000 // 5 minutes
   });
   ```

### Backend

1. **Database Indexing**:
   ```sql
   CREATE INDEX idx_products_status_type ON products(status, type);
   CREATE INDEX idx_orders_user_date ON orders(user_id, placed_at DESC);
   ```

2. **Caching**:
   ```typescript
   // Redis caching for product catalog
   const cached = await redis.get('products:coffee:active');
   if (cached) return JSON.parse(cached);
   
   const products = await db.products.find({ ... });
   await redis.setex('products:coffee:active', 300, JSON.stringify(products));
   ```

---

## Troubleshooting

### Common Issues

**Issue**: Stripe payment fails in development
**Solution**: Ensure Stripe CLI is running for webhook forwarding

**Issue**: Cart not persisting for guests
**Solution**: Check localStorage permissions and quotas

**Issue**: Hot reload not working
**Solution**: Check `vite.config.ts` HMR settings

**Issue**: Database connection errors
**Solution**: Verify PostgreSQL is running and credentials are correct

### Getting Help

1. Check the [Specification](../spec.md) for requirements
2. Review [API Contracts](./api-contracts.md) for endpoint details
3. See [Data Model](../data-model.md) for schema information
4. Consult [Research](../research.md) for architecture decisions

---

## Deployment

### Production Build Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Stripe webhooks configured
- [ ] Email templates customized
- [ ] CDN configured for static assets
- [ ] SSL certificate installed
- [ ] Monitoring/alerting set up

### Deployment Commands

```bash
# Build production assets
npm run build

# Run production migrations
npm run db:migrate:prod

# Start production server
npm start
```

---

**Next**: Generate tasks with `/speckit.tasks`
