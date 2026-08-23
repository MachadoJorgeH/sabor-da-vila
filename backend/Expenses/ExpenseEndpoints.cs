using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Expenses;

public static class ExpenseEndpoints
{
    public static void MapExpenseEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/expenses").RequireAuthorization();

        group.MapGet("/", async (ExpenseService service) =>
            Results.Ok(await service.ListAsync()));

        group.MapGet("/{id:guid}", async (Guid id, ExpenseService service) =>
        {
            var item = await service.GetByIdAsync(id);
            if (item is null)
                throw new NotFoundException("expense not found");
            return Results.Ok(item);
        });

        group.MapPost("/", async (ExpenseInput input, ExpenseService service) =>
        {
            var created = await service.CreateAsync(input);
            return Results.Created($"/api/expenses/{created.Id}", created);
        });

        group.MapPut("/{id:guid}", async (Guid id, ExpenseInput input, ExpenseService service) =>
        {
            var updated = await service.UpdateAsync(id, input);
            if (updated is null)
                throw new NotFoundException("expense not found");
            return Results.Ok(updated);
        });

        group.MapDelete("/{id:guid}", async (Guid id, ExpenseService service) =>
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                throw new NotFoundException("expense not found");
            return Results.NoContent();
        });
    }
}