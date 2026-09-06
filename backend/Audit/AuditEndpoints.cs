namespace SaborDaVila.Api.Audit;

public static class AuditEndpoints
{
    public static void MapAuditEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/logs").RequireAuthorization();

        group.MapGet("/", async (AuditService service, DateTime? from, DateTime? to) =>
        {
            var toUtc = DateTime.SpecifyKind(to ?? DateTime.UtcNow, DateTimeKind.Utc);
            var fromUtc = DateTime.SpecifyKind(from ?? toUtc.Date.AddDays(-1), DateTimeKind.Utc);
            return Results.Ok(await service.ListAsync(fromUtc, toUtc, 500));
        });
    }
}
