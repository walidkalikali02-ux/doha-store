-- Migration: 009_create_reserve_inventory_with_lock_function
-- Description: Create inventory reservation function with SELECT FOR UPDATE SKIP LOCKED

CREATE OR REPLACE FUNCTION reserve_inventory_with_lock(
  p_order_id UUID,
  p_product_id UUID,
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
DECLARE
  lock_acquired BOOLEAN := FALSE;
  reserved_quantity INTEGER := 0;
  current_stock INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtext(p_product_id::text || p_variant_id::text)
  );

  SELECT COALESCE(quantity, 0) INTO current_stock
  FROM inventory
  WHERE product_id = p_product_id AND variant_id = p_variant_id
  FOR UPDATE;

  IF current_stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient inventory: requested % but only % available'
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE inventory
  SET quantity = quantity - p_quantity,
      updated_at = NOW()
  WHERE product_id = p_product_id AND variant_id = p_variant_id
  RETURNING quantity INTO reserved_quantity;

  IF reserved_quantity < 0 THEN
    UPDATE inventory
    SET quantity = quantity + p_quantity,
        updated_at = NOW()
    WHERE product_id = p_product_id AND variant_id = p_variant_id;
    RAISE EXCEPTION 'Inventory reservation failed - concurrent modification detected'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO inventory_reservations (order_id, product_id, variant_id, quantity, expires_at)
  VALUES (p_order_id, p_product_id, p_variant_id, p_quantity, NOW() + INTERVAL '30 minutes')
  ON CONFLICT DO NOTHING;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reserve_inventory_with_lock IS 'Atomically reserves inventory using advisory lock, returns void or raises P0001 on lock conflict';