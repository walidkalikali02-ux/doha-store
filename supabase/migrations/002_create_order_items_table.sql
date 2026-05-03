-- Migration: 002_create_order_items_table
-- Description: Create order items table linked to orders

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON order_items(variant_id);

-- RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Service role can do anything"
  ON order_items FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE order_items IS 'Line items for each order';