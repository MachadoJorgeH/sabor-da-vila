CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    action      TEXT NOT NULL CHECK (action IN ('create','update','delete')),
    entity      TEXT NOT NULL CHECK (entity IN ('menu','inventory','expense')),
    description TEXT NOT NULL,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email  TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_created_at ON audit_log (created_at DESC);