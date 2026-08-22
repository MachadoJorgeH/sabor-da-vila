namespace SaborDaVila.Api.Common;

public abstract class AppException : Exception
{
    public abstract int StatusCode { get; }
    public abstract string Code { get; }

    protected AppException(string message) : base(message) { }
}