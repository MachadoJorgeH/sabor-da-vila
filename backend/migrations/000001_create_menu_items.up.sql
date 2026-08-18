CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price_cents BIGINT NOT NULL CHECK (price_cents >= 0),
    category TEXT NOT NULL CHECK (category IN ('Lanches','Bebidas','Sobremesas','Pizzas', 'Prato Feito')),
    photo_url TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_menu_items_active ON menu_items (category, name) WHERE active;
CREATE UNIQUE INDEX idx_menu_items_name_unique ON menu_items (name) WHERE active;