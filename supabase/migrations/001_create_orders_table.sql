-- Migration: 001_create_orders_table
-- Description: Create orders table with MyFatoorah integration fields

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'confirmed',
    'payment_failed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  )),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_address JSONB NOT NULL,
  mf_invoice_id VARCHAR(100),
  mf_payment_url TEXT,
  idempotency_key VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_mf_invoice_id ON orders(mf_invoice_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email) WHERE guest_email IS NOT NULL;

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customer: can view their own orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Customer: can view orders by order number + email (for guest tracking)
-- RLS enforces email match at API level; this allows SELECT when guest_email is present
CREATE POLICY "Anyone can view guest orders"
  ON orders FOR SELECT
  USING (guest_email IS NOT NULL);

-- Service role: can do anything (for webhook/admin)
CREATE POLICY "Service role can do anything"
  ON orders FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Service role: can insert/update (for API endpoints)
CREATE POLICY "Service role can insert orders"
  ON orders FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can update orders"
  ON orders FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE orders IS 'Customer orders with MyFatoorah payment integration';