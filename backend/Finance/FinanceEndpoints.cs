namespace SaborDaVila.Api.Finance;

public static class FinanceEndpoints
{
    public static void MapFinanceEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/finance").RequireAuthorization("Admin");

        group.MapGet("/summary", async (FinanceService service, DateTime? from, DateTime? to) =>
        {
            var (f, t) = DefaultRange(from, to);
            return Results.Ok(await service.GetSummaryAsync(f, t));
        });

        group.MapGet("/by-channel", async (FinanceService service, DateTime? from, DateTime? to) =>
        {
            var (f, t) = DefaultRange(from, to);
            return Results.Ok(await service.GetByChannelAsync(f, t));
        });

        group.MapGet("/daily", async (FinanceService service, int? days) =>
            Results.Ok(await service.GetDailyAsync(days ?? 30)));
    }

    private static (DateTime From, DateTime To) DefaultRange(DateTime? from, DateTime? to)
    {
        var to2 = to ?? DateTime.UtcNow;
        var from2 = from ?? to2.Date.AddDays(-30);
        return (AsUtc(from2), AsUtc(to2));
    }

    private static DateTime AsUtc(DateTime value) =>
        DateTime.SpecifyKind(value, DateTimeKind.Utc);
}