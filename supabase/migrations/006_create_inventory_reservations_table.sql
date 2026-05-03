-- Migration: 006_create_inventory_reservations_table
-- Description: Create inventory reservation table for optimistic locking during order creation

CREATE TABLE IF NOT EXISTS inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for inventory_reservations
CREATE INDEX IF NOT EXISTS idx_reservations_order_id ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_reservations_product_id ON inventory_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_reservations_variant_id ON inventory_reservations(variant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_expires_at ON inventory_reservations(expires_at);

-- RLS
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do anything"
  ON inventory_reservations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Function to release expired reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void AS $$
BEGIN
  DELETE FROM inventory_reservations WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add constraint to check inventory not already reserved for other pending orders
-- This is handled at the application level to avoid complex SQL constraints

COMMENT ON TABLE inventory_reservations IS 'Temporary inventory reservations during checkout window';