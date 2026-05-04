-- Migration: 010_add_performance_indexes
-- Description: Add indexes for cart and product query performance

-- Index for products.name search (used in admin product list)
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products(name varchar_pattern_ops);

-- Index for product_definitions category lookups
CREATE INDEX IF NOT EXISTS idx_product_definitions_category ON product_definitions(category);
CREATE INDEX IF NOT EXISTS idx_product_definitions_main_category ON product_definitions(main_category);
CREATE INDEX IF NOT EXISTS idx_product_definitions_sku ON product_definitions(sku) WHERE sku IS NOT NULL;

-- Index for inventory items (most common queries)
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON inventory_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_id ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_location ON inventory_items(product_id, location_id) WHERE type = 'PRODUCT';

-- Index for order_items (cart/order lookups)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Index for orders (status and user lookups)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Index for discounts (code validation)
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code) WHERE is_active = true;

-- Index for addresses (user addresses lookup)
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- Index for audit_log (admin actions tracking)
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Comment
COMMENT ON TABLE performance_indexes IS 'Performance optimization indexes for frequently queried columns';