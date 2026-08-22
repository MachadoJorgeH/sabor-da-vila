namespace SaborDaVila.Api.Auth;

public record User (
    Guid Id,
    string Email,
    string PasswordHash,
    string Name,
    string Role,
    DateTime CreatedAt
);