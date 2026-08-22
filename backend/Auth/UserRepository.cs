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

    public async Task<User> CreateAsync(string email, string passwordHash, string name, string role)
    {
        const string sql = """
            INSERT INTO users (email, password_hash, name, role)
            VALUES (@Email, @PasswordHash, @Name, @Role)
            RETURNING id AS "Id", email AS "Email", password_hash AS "PasswordHash",
                      name AS "Name", role AS "Role", created_at AS "CreatedAt"
            """;
        
        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleAsync<User>(sql, new{ Email = email, PasswordHash = passwordHash, Name = name, Role = role });
    }
}