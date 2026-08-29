CREATE TABLE orders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_label TEXT NOT NULL,
    origin      TEXT NOT NULL CHECK (origin IN ('hall','app')),
    status      TEXT NOT NULL DEFAULT 'received'
                CHECK (status IN ('received','preparing','ready','delivered')),
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_orders_open ON orders (created_at) WHERE status <> 'delivered';

CREATE TABLE order_items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id     UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name             TEXT NOT NULL,
    unit_price_cents BIGINT NOT NULL CHECK (unit_price_cents >= 0),
    quantity         INTEGER NOT NULL CHECK (quantity > 0)
);
CREATE INDEX idx_order_items_order ON order_items (order_id);

CREATE TABLE sales (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID UNIQUE REFERENCES orders(id) ON DELETE SET NULL,
    table_label TEXT NOT NULL,
    origin      TEXT NOT NULL CHECK (origin IN ('hall','app')),
    note        TEXT,
    total_cents BIGINT NOT NULL CHECK (total_cents >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sales_created_at ON sales (created_at DESC);
CREATE INDEX idx_sales_origin ON sales (origin, created_at DESC);

CREATE TABLE sale_items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id          UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    menu_item_id     UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    name             TEXT NOT NULL,
    unit_price_cents BIGINT NOT NULL,
    quantity         INTEGER NOT NULL CHECK (quantity > 0)
);
CREATE INDEX idx_sale_items_sale ON sale_items (sale_id);