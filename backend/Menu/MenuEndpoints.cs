using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Menu;

public static class MenuEndpoints
{
    public static void MapMenuEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/menu");

        group.MapGet("/", async (MenuService service) =>
            Results.Ok(await service.ListAsync()));

        group.MapGet("/{id:guid}", async (Guid id, MenuService service) =>
        {
            var item = await service.GetByIdAsync(id);
            if (item is null)
                throw new NotFoundException("menu item not found");
            return Results.Ok(item);
        });

        group.MapPost("/", async (MenuItemInput input, MenuService service) =>
        {
            var created = await service.CreateAsync(input);
            return Results.Created($"/api/menu/{created.Id}", created);
        });

        group.MapPut("/{id:guid}", async (Guid id, MenuItemInput input, MenuService service) =>
        {
            var updated = await service.UpdateAsync(id, input);
            if (updated is null)
                throw new NotFoundException("menu item not found");
            return Results.Ok(updated);
        });

        group.MapDelete("/{id:guid}", async (Guid id, MenuService service) =>
        {
            var removed = await service.RemoveAsync(id);
            if (!removed)
                throw new NotFoundException("menu item not found");
            return Results.NoContent();
        });
    }
}