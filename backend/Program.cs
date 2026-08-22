using Npgsql;
using SaborDaVila.Api.Menu;
using SaborDaVila.Api.Common;
using SaborDaVila.Api.Auth;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Postgres") ?? throw new InvalidOperationException("Connection string 'Postgres' não configurada.");

var dataSource = NpgsqlDataSource.Create(connectionString);
builder.Services.AddSingleton(dataSource);
builder.Services.AddScoped<MenuRepository>();
builder.Services.AddScoped<MenuService>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

var app = builder.Build();

app.UseExceptionHandler();

app.MapMenuEndpoints();

app.MapGet("/api/health", async (NpgsqlDataSource db) =>
{
    await using var command = db.CreateCommand("SELECT 1");
    await command.ExecuteScalarAsync();
    return new { ok = true };
}

);

app.Run();