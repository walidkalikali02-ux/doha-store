-- Migration: 008_create_inventory_log_table
-- Description: Create inventory audit log for tracking manual adjustments

CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  variant_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  old_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for inventory_logs
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_variant_id ON inventory_logs(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_admin_id ON inventory_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);

-- RLS
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do anything
CREATE POLICY "Service role can do anything"
  ON inventory_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE inventory_logs IS 'Audit log for inventory adjustments made by admins';
