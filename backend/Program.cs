using Npgsql;
using SaborDaVila.Api.Menu;
using SaborDaVila.Api.Common;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Postgres") ?? throw new InvalidOperationException("Connection string 'Postgres' não configurada.");

var dataSource = NpgsqlDataSource.Create(connectionString);
builder.Services.AddSingleton(dataSource);
builder.Services.AddScoped<MenuRepository>();
builder.Services.AddScoped<MenuService>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

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