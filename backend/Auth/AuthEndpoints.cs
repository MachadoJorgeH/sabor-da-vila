namespace SaborDaVila.Api.Auth;
using System.Security.Claims;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");

        group.MapPost("/login", async (LoginInput input, AuthService service) =>
        {
            var result = await service.LoginAsync(input);
            return Results.Ok(result);
        });

        group.MapGet("/me", (ClaimsPrincipal user) =>
        {
            return Results.Ok(new
            {
                id = user.FindFirstValue("sub"),
                email = user.FindFirstValue("email"),
                name = user.FindFirstValue("name"),
                role = user.FindFirstValue("role")
            });
        }).RequireAuthorization();
    }
}