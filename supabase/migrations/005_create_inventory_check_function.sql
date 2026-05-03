-- Migration: 005_create_inventory_check_function
-- Description: Create inventory validation function

CREATE OR REPLACE FUNCTION check_inventory(
  p_product_id UUID,
  p_variant_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  available INTEGER;
BEGIN
  SELECT COALESCE(inventory.quantity, 0) INTO available
  FROM inventory
  WHERE product_id = p_product_id AND variant_id = p_variant_id;

  RETURN available >= p_quantity;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_inventory IS 'Check if inventory is available for a product/variant';