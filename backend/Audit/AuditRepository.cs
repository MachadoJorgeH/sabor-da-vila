using Dapper;
using Npgsql;

namespace SaborDaVila.Api.Audit;

public class AuditRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public AuditRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task RecordAsync(string action, string entity, string description, Guid? userId, string userEmail)
    {
        const string sql = """
            INSERT INTO audit_log (action, entity, description, user_id, user_email)
            VALUES (@Action, @Entity, @Description, @UserId, @UserEmail)
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        await conn.ExecuteAsync(sql, new
        {
            Action = action,
            Entity = entity,
            Description = description,
            UserId = userId,
            UserEmail = userEmail
        });
    }

    public async Task<IReadOnlyList<AuditLogEntry>> ListAsync(DateTime from, DateTime to, int limit)
    {
        const string sql = """
            SELECT id AS "Id", action AS "Action", entity AS "Entity", description AS "Description",
                   user_id AS "UserId", user_email AS "UserEmail", created_at AS "CreatedAt"
            FROM audit_log
            WHERE created_at >= @From AND created_at < @To
            ORDER BY created_at DESC
            LIMIT @Limit
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        var items = await conn.QueryAsync<AuditLogEntry>(sql, new { From = from, To = to, Limit = limit });
        return items.ToList();
    }
}