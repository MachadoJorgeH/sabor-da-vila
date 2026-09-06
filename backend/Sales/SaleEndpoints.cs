namespace SaborDaVila.Api.Sales;

public static class SaleEndpoints
{
    public static void MapSaleEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/sales").RequireAuthorization();

        group.MapGet("/", async (SaleService service, DateTime? from, DateTime? to) =>
        {
            var toUtc = DateTime.SpecifyKind(to ?? DateTime.UtcNow, DateTimeKind.Utc);
            var fromUtc = DateTime.SpecifyKind(from ?? toUtc.Date.AddDays(-1), DateTimeKind.Utc);
            return Results.Ok(await service.ListAsync(fromUtc, toUtc));
        });

        group.MapPost("/", async (SaleInput input, SaleService service) =>
        {
            var created = await service.CreateAsync(input);
            return Results.Created($"/api/sales/{created.Id}", created);
        }).RequireAuthorization("Admin");
    }
}
