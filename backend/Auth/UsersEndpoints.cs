using System.Security.Claims;
using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Auth;

public static class UsersEndpoints
{
    public static void MapUsersEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/users").RequireAuthorization("Admin");

        group.MapGet("/", async (UsersService service) =>
            Results.Ok(await service.ListAsync()));

        group.MapPost("/", async (CreateUserInput input, UsersService service) =>
        {
            var created = await service.CreateAsync(input);
            return Results.Created($"/api/users/{created.Id}", created);
        });

        group.MapPut("/{id:guid}", async (Guid id, UpdateUserInput input, UsersService service) =>
        {
            var updated = await service.UpdateAsync(id, input);
            if (updated is null)
                throw new NotFoundException("user not found");
            return Results.Ok(updated);
        });

        group.MapDelete("/{id:guid}", async (Guid id, UsersService service, ClaimsPrincipal principal) =>
        {
            if (principal.FindFirstValue("sub") == id.ToString())
                throw new ValidationException("you cannot delete your own user");

            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                throw new NotFoundException("user not found");
            return Results.NoContent();
        });
    }
}
