using Npgsql;

var builder = WebApplication.CreateBuilder(args);

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

var connectionString = builder.Configuration.GetConnectionString("Postgres") ?? throw new InvalidOperationException("Connection string 'Postgres' não configurada.");

var dataSource = NpgsqlDataSource.Create(connectionString);
builder.Services.AddSingleton(dataSource);

var app = builder.Build();

app.MapGet("/api/health", async (NpgsqlDataSource db) =>
{
    await using var command = db.CreateCommand("SELECT 1");
    await command.ExecuteScalarAsync();
    return new { ok = true };
}

);

app.Run();