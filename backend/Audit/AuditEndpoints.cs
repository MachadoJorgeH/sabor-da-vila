namespace SaborDaVila.Api.Audit;

public static class AuditEndpoints
{
    public static void MapAuditEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/logs").RequireAuthorization();

        group.MapGet("/", async (AuditService service) =>
            Results.Ok(await service.ListAsync(100)));
    }
}