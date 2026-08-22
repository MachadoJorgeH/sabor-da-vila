using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Inventory;

public static class InventoryEndpoints
{
    public static void MapInventoryEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/inventory").RequireAuthorization();

        group.MapGet("/", async (InventoryService service) =>
            Results.Ok(await service.ListAsync()));

        group.MapGet("/{id:guid}", async (Guid id, InventoryService service) =>
        {
            var item = await service.GetByIdAsync(id);
            if (item is null)
                throw new NotFoundException("inventory item not found");
            return Results.Ok(item);
        });

        group.MapPost("/", async (InventoryItemInput input, InventoryService service) =>
        {
            var created = await service.CreateAsync(input);
            return Results.Created($"/api/inventory/{created.Id}", created);
        });

        group.MapPut("/{id:guid}", async (Guid id, InventoryItemInput input, InventoryService service) =>
        {
            var updated = await service.UpdateAsync(id, input);
            if (updated is null)
                throw new NotFoundException("inventory item not found");
            return Results.Ok(updated);
        });

        group.MapDelete("/{id:guid}", async (Guid id, InventoryService service) =>
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                throw new NotFoundException("inventory item not found");
            return Results.NoContent();
        });
    }
}