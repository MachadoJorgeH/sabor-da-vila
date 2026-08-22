CREATE TABLE inventory_items (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    quantity   NUMERIC(12,3) NOT NULL CHECK (quantity >= 0),
    unit       TEXT NOT NULL,
    cost_cents BIGINT NOT NULL CHECK (cost_cents >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_items_created_at ON inventory_items (created_at DESC);