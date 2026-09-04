ALTER TABLE menu_items DROP CONSTRAINT menu_items_category_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check
    CHECK (category IN ('Lanches','Bebidas','Sobremesas','Pizzas','Prato Feito'));