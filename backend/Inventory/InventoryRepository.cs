using Dapper;
using Npgsql;

namespace SaborDaVila.Api.Inventory;

public class InventoryRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public InventoryRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<IReadOnlyList<InventoryItem>> ListAsync()
    {
        const string sql = """
            SELECT id AS "Id", name AS "Name", quantity AS "Quantity", unit AS "Unit",
                   cost_cents AS "CostCents", created_at AS "CreatedAt"
            FROM inventory_items
            ORDER BY created_at DESC
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        var items = await conn.QueryAsync<InventoryItem>(sql);
        return items.ToList();
    }

    public async Task<InventoryItem?> GetByIdAsync(Guid id)
    {
        const string sql = """
            SELECT id AS "Id", name AS "Name", quantity AS "Quantity", unit AS "Unit",
                   cost_cents AS "CostCents", created_at AS "CreatedAt"
            FROM inventory_items
            WHERE id = @Id
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<InventoryItem>(sql, new { Id = id });
    }

    public async Task<InventoryItem> CreateAsync(InventoryItemInput input)
    {
        const string sql = """
            INSERT INTO inventory_items (name, quantity, unit, cost_cents)
            VALUES (@Name, @Quantity, @Unit, @CostCents)
            RETURNING id AS "Id", name AS "Name", quantity AS "Quantity", unit AS "Unit",
                      cost_cents AS "CostCents", created_at AS "CreatedAt"
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleAsync<InventoryItem>(sql, input);
    }

    public async Task<InventoryItem?> UpdateAsync(Guid id, InventoryItemInput input)
    {
        const string sql = """
            UPDATE inventory_items
            SET name = @Name, quantity = @Quantity, unit = @Unit, cost_cents = @CostCents
            WHERE id = @Id
            RETURNING id AS "Id", name AS "Name", quantity AS "Quantity", unit AS "Unit",
                      cost_cents AS "CostCents", created_at AS "CreatedAt"
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<InventoryItem>(sql, new
        {
            Id = id,
            input.Name,
            input.Quantity,
            input.Unit,
            input.CostCents
        });
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        const string sql = "DELETE FROM inventory_items WHERE id = @Id";

        await using var conn = await _dataSource.OpenConnectionAsync();
        var affected = await conn.ExecuteAsync(sql, new { Id = id });
        return affected > 0;
    }
}