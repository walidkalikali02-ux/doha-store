-- Migration: 007_add_order_locking_support
-- Description: Add advisory lock function for order status transitions

-- Function to acquire advisory lock for order processing
CREATE OR REPLACE FUNCTION acquire_order_lock(lock_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
  acquired BOOLEAN;
BEGIN
  acquired := pg_try_advisory_lock(lock_id);
  RETURN acquired;
END;
$$ LANGUAGE plpgsql;

-- Function to release advisory lock
CREATE OR REPLACE FUNCTION release_order_lock(lock_id BIGINT)
RETURNS VOID AS $$
BEGIN
  PERFORM pg_advisory_unlock(lock_id);
END;
$$ LANGUAGE plpgsql;

-- Ensure idempotency_key index exists (it should from initial migration)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

COMMENT ON FUNCTION acquire_order_lock IS 'Acquire advisory lock for order processing';
COMMENT ON FUNCTION release_order_lock IS 'Release advisory lock for order processing';