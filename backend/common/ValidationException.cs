namespace SaborDaVila.Api.Common;

public class ValidationException : AppException
{
    public override int StatusCode => 400;
    public override string Code => "validation_error";

    public ValidationException(string message) : base(message) { }
}