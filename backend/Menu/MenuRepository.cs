using Dapper;
using Npgsql;

namespace SaborDaVila.Api.Menu;

public class MenuRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public MenuRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<IReadOnlyList<MenuItem>> ListAsync()
    {
        const string sql = """
            SELECT id, name, price_cents, category, photo_url, active, created_at, updated_at
            FROM menu_items
            WHERE active
            ORDER BY category, name
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        var items = await conn.QueryAsync<MenuItem>(sql);
        return items.ToList();
    }

    public async Task<MenuItem?> GetByIdAsync(Guid id)
    {
        const string sql = """
            SELECT id, name, price_cents, category, photo_url, active, created_at, updated_at
            FROM menu_items
            WHERE id = @Id
            """;
        
        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<MenuItem>(sql, new { Id = id});
    }

    public async Task<MenuItem> CreateAsync(MenuItemInput input)
    {
        const string sql = """
            INSERT INTO menu_items (name, price_cents, category, photo_url)
            VALUES (@Name, @PriceCents, @Category, @PhotoUrl)
            RETURNING id, name, price_cents, category, photo_url, active, created_at, updated_at
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleAsync<MenuItem>(sql, input);
    }

    public async Task<MenuItem?> UpdateAsync(Guid id, MenuItemInput input)
    {
        const string sql = """
            UPDATE menu_items
            SET name = @Name, price_cents = @PriceCents, category = @Category,
                photo_url = @PhotoUrl, updated_at = now()
            WHERE id = @Id
            RETURNING id, name, price_cents, category, photo_url, active, created_at, updated_at
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<MenuItem>(sql, new
        {
            Id = id,
            input.Name,
            input.PriceCents,
            input.Category,
            input.PhotoUrl
        });
    }

    public async Task<bool> DeactivateAsync(Guid id)
    {
        const string sql = """
            UPDATE menu_items SET active = false, updated_at = now()
            WHERE id = @Id
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        var affected = await conn.ExecuteAsync(sql, new { Id = id});
        return affected > 0;
    }
}