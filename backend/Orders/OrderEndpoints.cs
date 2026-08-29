using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Orders;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/orders").RequireAuthorization();

        group.MapGet("/", async (OrderService service, DateTime? since) =>
        {
            var from = since ?? DateTime.UtcNow.Date;
            return Results.Ok(await service.ListAsync(from));
        });

        group.MapGet("/{id:guid}", async (Guid id, OrderService service) =>
        {
            var order = await service.GetByIdAsync(id)
                ?? throw new NotFoundException("order not found");
            return Results.Ok(order);
        });

        group.MapPost("/", async (OrderInput input, OrderService service) =>
        {
            var created = await service.CreateAsync(input);
            return Results.Created($"/api/orders/{created.Id}", created);
        });

        group.MapPost("/{id:guid}/advance", async (Guid id, OrderService service) =>
        {
            var updated = await service.AdvanceStatusAsync(id);
            return Results.Ok(updated);
        });

        group.MapDelete("/{id:guid}", async (Guid id, OrderService service) =>
        {
            var removed = await service.RemoveAsync(id);
            if (!removed)
                throw new NotFoundException("order not found");
            return Results.NoContent();
        });
    }
}