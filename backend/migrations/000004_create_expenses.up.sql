CREATE TABLE expenses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description  TEXT NOT NULL,
    category     TEXT NOT NULL
                 CHECK (category IN ('Aluguel','Fornecedores','Contas','Funcionários','Manutenção','Outros')),
    amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_created_at ON expenses (created_at DESC);