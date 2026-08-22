namespace SaborDaVila.Api.Common;

public class NotFoundException : AppException
{
    public override int StatusCode => 404;
    public override string Code => "not_found";

    public NotFoundException(string message) : base(message) { }
}