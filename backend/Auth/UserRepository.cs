using Dapper;
using Npgsql;

namespace SaborDaVila.Api.Auth;

public class UserRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public UserRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = """
            SELECT id AS "Id", email AS "Email", password_hash AS "PasswordHash",
                   name AS "Name", role AS "Role", created_at AS "CreatedAt"
            FROM users
            WHERE email = @Email
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<IReadOnlyList<User>> ListAsync()
    {
        const string sql = """
            SELECT id AS "Id", email AS "Email", password_hash AS "PasswordHash",
                   name AS "Name", role AS "Role", created_at AS "CreatedAt"
            FROM users
            ORDER BY created_at
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        var users = await conn.QueryAsync<User>(sql);
        return users.ToList();
    }

    public async Task<User> CreateAsync(string email, string passwordHash, string name, string role)
    {
        const string sql = """
            INSERT INTO users (email, password_hash, name, role)
            VALUES (@Email, @PasswordHash, @Name, @Role)
            RETURNING id AS "Id", email AS "Email", password_hash AS "PasswordHash",
                      name AS "Name", role AS "Role", created_at AS "CreatedAt"
            """;

        try
        {
            await using var conn = await _dataSource.OpenConnectionAsync();
            return await conn.QuerySingleAsync<User>(sql,
                new { Email = email, PasswordHash = passwordHash, Name = name, Role = role });
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new DuplicateEmailException();
        }
    }

    public async Task<User?> UpdateAsync(Guid id, string name, string role, string? passwordHash)
    {
        const string sql = """
            UPDATE users
            SET name = @Name, role = @Role,
                password_hash = COALESCE(@PasswordHash, password_hash)
            WHERE id = @Id
            RETURNING id AS "Id", email AS "Email", password_hash AS "PasswordHash",
                      name AS "Name", role AS "Role", created_at AS "CreatedAt"
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<User>(sql,
            new { Id = id, Name = name, Role = role, PasswordHash = passwordHash });
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        const string sql = "DELETE FROM users WHERE id = @Id";

        await using var conn = await _dataSource.OpenConnectionAsync();
        var affected = await conn.ExecuteAsync(sql, new { Id = id });
        return affected > 0;
    }
}
