using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Auth;

public class DuplicateEmailException : AppException
{
    public override int StatusCode => 409;
    public override string Code => "duplicate_email";

    public DuplicateEmailException() : base("email already in use") { }
}
