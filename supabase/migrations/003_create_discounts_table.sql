-- Migration: 003_create_discounts_table
-- Description: Create discounts/promocodes table

CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for discounts
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_is_active ON discounts(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active discounts"
  ON discounts FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can do anything"
  ON discounts FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE discounts IS 'Promotional discount codes';