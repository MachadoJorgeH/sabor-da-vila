namespace SaborDaVila.Api.Auth;

public record LoginInput(string Email, string Password);

public record LoginResult(string Token, DateTime ExpiresAt, UserInfo User);

public record UserInfo(Guid Id, string Email, string Name, string Role);