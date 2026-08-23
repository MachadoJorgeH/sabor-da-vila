using Dapper;
using Npgsql;

namespace SaborDaVila.Api.Expenses;

public class ExpenseRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public ExpenseRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<IReadOnlyList<Expense>> ListAsync()
    {
        const string sql = """
            SELECT id AS "Id", description AS "Description", category AS "Category",
                   amount_cents AS "AmountCents", created_at AS "CreatedAt"
            FROM expenses
            ORDER BY created_at DESC
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        var items = await conn.QueryAsync<Expense>(sql);
        return items.ToList();
    }

    public async Task<Expense?> GetByIdAsync(Guid id)
    {
        const string sql = """
            SELECT id AS "Id", description AS "Description", category AS "Category",
                   amount_cents AS "AmountCents", created_at AS "CreatedAt"
            FROM expenses
            WHERE id = @Id
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Expense>(sql, new { Id = id });
    }

    public async Task<Expense> CreateAsync(ExpenseInput input)
    {
        const string sql = """
            INSERT INTO expenses (description, category, amount_cents)
            VALUES (@Description, @Category, @AmountCents)
            RETURNING id AS "Id", description AS "Description", category AS "Category",
                      amount_cents AS "AmountCents", created_at AS "CreatedAt"
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleAsync<Expense>(sql, input);
    }

    public async Task<Expense?> UpdateAsync(Guid id, ExpenseInput input)
    {
        const string sql = """
            UPDATE expenses
            SET description = @Description, category = @Category, amount_cents = @AmountCents
            WHERE id = @Id
            RETURNING id AS "Id", description AS "Description", category AS "Category",
                      amount_cents AS "AmountCents", created_at AS "CreatedAt"
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleOrDefaultAsync<Expense>(sql, new
        {
            Id = id,
            input.Description,
            input.Category,
            input.AmountCents
        });
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        const string sql = "DELETE FROM expenses WHERE id = @Id";

        await using var conn = await _dataSource.OpenConnectionAsync();
        var affected = await conn.ExecuteAsync(sql, new { Id = id });
        return affected > 0;
    }
}