using Microsoft.AspNetCore.Diagnostics;

namespace SaborDaVila.Api.Common;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is AppException appException)
        {
            httpContext.Response.StatusCode = appException.StatusCode;
            await httpContext.Response.WriteAsJsonAsync(
                new { error = new ApiError(appException.Code, appException.Message)},
                cancellationToken
            );
            return true;
        }

        _logger.LogError(exception, "unhandled exception");
        httpContext.Response.StatusCode = 500;
        await httpContext.Response.WriteAsJsonAsync(
            new { error = new ApiError("internal_error", "internal server error")},
            cancellationToken
        );
        return true;
    }
    
}