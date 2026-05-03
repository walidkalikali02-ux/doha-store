# Research: Roastery E-Commerce Platform

**Date**: 2025-01-07  
**Feature**: Roastery E-Commerce Platform  
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

---

## Research Summary

This document consolidates research decisions for the roastery e-commerce platform implementation. The project is a comprehensive web application requiring modern frontend technologies, secure payment processing, and scalable architecture.

---

## Technology Stack Decisions

### Frontend Framework

**Decision**: React 19 with TypeScript 5.8

**Rationale**:
- React 19 offers improved performance and new features (Server Components, Actions)
- Strong ecosystem for e-commerce (cart state management, form handling)
- TypeScript provides type safety for complex e-commerce data models
- Vite 6 provides fast development and optimized production builds
- Team familiarity with React ecosystem

**Alternatives Considered**:
- Next.js 14: Good for SEO but adds complexity not needed for initial MVP
- Vue 3: Excellent option but less e-commerce library support
- Svelte: Great performance but smaller ecosystem for e-commerce

### Styling & UI

**Decision**: Tailwind CSS 4 + Lucide React + Motion

**Rationale**:
- Tailwind CSS 4 offers improved performance and new features
- Utility-first approach enables rapid UI development
- Lucide React provides comprehensive icon set for e-commerce
- Motion (Framer Motion successor) for smooth animations and transitions
- Responsive design out-of-the-box for mobile-first approach

### State Management

**Decision**: React Context + Zustand for complex state

**Rationale**:
- React Context sufficient for theme, auth, and user preferences
- Zustand for cart state (lightweight, no boilerplate vs Redux)
- Server state via React Query/TanStack Query for API data
- Avoids Redux complexity for this scale

**Cart State Requirements**:
- Persist across sessions (localStorage for guests)
- Sync with server for logged-in users
- Handle complex variant selections (size × grind)
- Real-time inventory validation

### Routing

**Decision**: React Router 7

**Rationale**:
- Declarative routing with data loaders
- Nested routes for complex layouts (shop filters, checkout steps)
- URL-based state for filters (shareable URLs)
- Lazy loading support for code splitting

### Payment Processing

**Decision**: Stripe Elements + PayPal SDK

**Rationale**:
- Stripe Elements provides PCI-compliant card inputs
- Tokenization keeps sensitive data off servers
- PayPal offers alternative payment method with broad acceptance
- Apple Pay / Google Pay via Stripe Payment Request Button
- Supports split payments (gift card + credit card)

**Security Considerations**:
- Never store raw card numbers (tokenization only)
- Implement 3D Secure for added fraud protection
- Webhook verification for payment confirmations

### Backend & Database

**Decision**: Node.js/Express API + PostgreSQL + Redis

**Rationale**:
- Node.js for consistent JavaScript/TypeScript stack
- PostgreSQL for relational data (orders, products, users)
- JSONB support for flexible product attributes
- Redis for session storage and caching
- Supports 1000+ concurrent users

**Schema Considerations**:
- Product variants as separate table (size × grind combinations)
- Inventory tracking at variant level
- Order history with audit trail
- Subscription billing cycle management

### Email Service

**Decision**: SendGrid (transactional) + Klaviyo (marketing)

**Rationale**:
- SendGrid reliable for transactional emails (order confirmations)
- Klaviyo advanced segmentation for marketing automation
- Abandoned cart recovery workflows
- Template management and A/B testing

### Shipping Integration

**Decision**: USPS API + UPS API

**Rationale**:
- USPS best for lightweight packages (coffee bags)
- UPS for expedited shipping options
- Real-time rate calculation at checkout
- Label generation for admin dashboard
- Tracking number integration

---

## Architecture Decisions

### Authentication Flow

**Decision**: JWT access tokens + HTTP-only refresh cookies

**Implementation**:
1. User logs in via email/password or OAuth (Google, Facebook, Apple)
2. Server issues short-lived JWT (15 min) + long-lived refresh token (7 days)
3. Refresh token stored in HTTP-only cookie (XSS protection)
4. Access token stored in memory (React Context)
5. Silent refresh before token expiry

**Social Login**:
- Google OAuth 2.0
- Facebook Login
- Apple Sign In (required for iOS apps, good for web)

### Cart Persistence

**Decision**: Hybrid approach (guest + authenticated)

**Guest Users**:
- Cart stored in localStorage
- 30-day expiration
- Merged to account on login

**Authenticated Users**:
- Cart synced to database
- Real-time across devices
- Survives browser clear

### Inventory Management

**Decision**: Optimistic locking with reservation

**Flow**:
1. Add to cart → Reserve inventory (30-minute hold)
2. Cart expiry timer displayed
3. Checkout completion → Deduct inventory
4. Cart abandonment → Release reservation
5. Low stock threshold alerts to admin

**Race Condition Handling**:
- Database-level constraints prevent overselling
- Last-resort check before payment capture
- Order rejected if inventory unavailable

### Subscription Billing

**Decision**: Stripe Billing with custom scheduling

**Implementation**:
- Stripe Customer for each subscriber
- Stripe Subscription with metadata for coffee preferences
- Webhook handling for payment failures
- Retry logic: 3 attempts over 7 days
- Pause/skip via Stripe API + local state

**Billing Cycles**:
- Weekly: Every 7 days from start date
- Bi-weekly: Every 14 days
- Monthly: Same date each month

### Image Handling

**Decision**: CDN with responsive images

**Implementation**:
- Product images uploaded to cloud storage (S3/Cloudinary)
- Multiple sizes generated (thumbnail, gallery, zoom)
- Lazy loading with blur-up placeholders
- WebP format with JPEG fallback

---

## Performance Optimizations

### Frontend

1. **Code Splitting**: Route-based lazy loading
2. **Image Optimization**: Responsive images, lazy loading, WebP
3. **Caching**: React Query for server state, SWR for stale-while-revalidate
4. **Bundle Size**: Tree shaking, dynamic imports for heavy components
5. **Critical CSS**: Inline above-fold styles

### Backend

1. **Database Indexing**: Product search, order lookups
2. **Query Optimization**: N+1 prevention via eager loading
3. **Caching**: Redis for product catalog, user sessions
4. **CDN**: Static assets served from edge locations
5. **Rate Limiting**: API endpoint protection

### Targets

- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Performance Score: >90
- API Response Time (p95): <200ms

---

## Security Measures

### Data Protection

1. **Encryption**: AES-256 for sensitive data at rest
2. **HTTPS**: TLS 1.3 for all communications
3. **Passwords**: bcrypt hashing (cost factor 12)
4. **PII**: Minimal collection, encrypted storage

### Compliance

1. **PCI DSS**: Stripe Elements handles card data (SAQ A)
2. **GDPR**: Data export, deletion (90-day retention)
3. **CCPA**: Do Not Sell, privacy policy
4. **WCAG 2.1 AA**: Keyboard navigation, ARIA labels, color contrast

### Threat Mitigation

1. **CSRF Protection**: Tokens for state-changing operations
2. **XSS Prevention**: Input sanitization, CSP headers
3. **SQL Injection**: Parameterized queries (ORM)
4. **Rate Limiting**: Brute force protection (5 attempts lockout)
5. **Dependency Scanning**: Automated vulnerability checks

---

## Scalability Considerations

### Current Scale

- 1000 concurrent users
- 10,000 products
- 100,000 registered users
- 1000 orders/day peak

### Growth Path

1. **Horizontal Scaling**: Load balancer + multiple API instances
2. **Database Scaling**: Read replicas, connection pooling
3. **Caching Strategy**: CDN, Redis cluster
4. **Async Processing**: Queue for emails, reports, exports

### Monitoring

- Application performance monitoring (APM)
- Error tracking (Sentry)
- Uptime monitoring
- Business metrics dashboard

---

## Unknowns & Risks

### Technical Risks

1. **Third-party API Reliability**: Shipping carrier API downtime
   - *Mitigation*: Cached rates, fallback carriers, manual entry option

2. **Payment Failures**: Complex retry logic for subscriptions
   - *Mitigation*: Comprehensive webhook handling, customer notifications

3. **Inventory Sync**: Real-time accuracy across channels
   - *Mitigation*: Database constraints, periodic reconciliation

### Business Risks

1. **Chargebacks**: Coffee freshness claims
   - *Mitigation*: Clear policies, tracking integration, customer service

2. **Seasonal Demand**: Holiday traffic spikes
   - *Mitigation*: Auto-scaling infrastructure, load testing

---

## Research Artifacts

- [ ] API documentation for Stripe, PayPal, USPS, UPS
- [ ] Competitor analysis (Blue Bottle, Counter Culture)
- [ ] Accessibility audit checklist
- [ ] Security penetration test plan

---

**Next Phase**: [Phase 1 - Design & Contracts](./plan.md#phase-1-design--contracts)
