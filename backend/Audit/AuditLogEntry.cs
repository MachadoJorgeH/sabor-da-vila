namespace SaborDaVila.Api.Audit;

public record AuditLogEntry(
    long Id,
    string Action,
    string Entity,
    string Description,
    Guid? UserId,
    string UserEmail,
    DateTime CreatedAt
);