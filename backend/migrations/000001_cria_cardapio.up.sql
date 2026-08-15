CREATE TABLE cardapio_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    preco_centavos BIGINT NOT NULL CHECK (preco_centavos >= 0),
    categoria TEXT NOT NULL check (categoria IN ('Lanches', 'Bebidas', 'Sobremesas', 'Pizzas', 'Prato Feito')),
    foto_url TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cardapio_ativo ON cardapio_itens (categoria, nome) WHERE ativo;