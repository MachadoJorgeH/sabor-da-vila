using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Npgsql;
using SaborDaVila.Api.Menu;
using SaborDaVila.Api.Common;
using SaborDaVila.Api.Auth;
using SaborDaVila.Api.Inventory;
using SaborDaVila.Api.Expenses;
using SaborDaVila.Api.Audit;


var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Postgres") ?? throw new InvalidOperationException("Connection string 'Postgres' não configurada.");

var dataSource = NpgsqlDataSource.Create(connectionString);
builder.Services.AddSingleton(dataSource);
builder.Services.AddScoped<MenuRepository>();
builder.Services.AddScoped<MenuService>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<InventoryRepository>();
builder.Services.AddScoped<InventoryService>();
builder.Services.AddScoped<ExpenseRepository>();
builder.Services.AddScoped<ExpenseService>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<AuditRepository>();
builder.Services.AddScoped<AuditService>();
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret)),
            RoleClaimType = "role"
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();
if (args.Length > 0 && args[0] == "create-user")
{
    using var scope = app.Services.CreateScope();
    var authService = scope.ServiceProvider.GetRequiredService<AuthService>();
    var role = args.Length > 4 ? args[4] : "admin";
    var newUser = await authService.CreateUserAsync(args[1], args[2], args[3], role);
    Console.WriteLine($"Usuário criado: {newUser.Id} <{newUser.Email}> role={newUser.Role}");
    return;
}

app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();
app.MapMenuEndpoints();
app.MapAuthEndpoints();
app.MapInventoryEndpoints();
app.MapExpenseEndpoints();
app.MapExpenseEndpoints();
app.MapAuditEndpoints();

app.MapGet("/api/health", async (NpgsqlDataSource db) =>
{
    await using var command = db.CreateCommand("SELECT 1");
    await command.ExecuteScalarAsync();
    return new { ok = true };
}

);

app.Run();