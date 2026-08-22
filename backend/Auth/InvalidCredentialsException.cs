using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Auth;

public class InvalidCredentialsException : AppException
{
    public override int StatusCode => 401;
    public override string Code => "invalid_credentials";

    public InvalidCredentialsException() : base("invalid email or password") { }
}