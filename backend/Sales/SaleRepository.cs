using Dapper;
using Npgsql;

namespace SaborDaVila.Api.Sales;

public class SaleRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public SaleRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<IReadOnlyList<Sale>> ListAsync(DateTime from, DateTime to)
    {
        const string salesSql = """
            SELECT id AS "Id", order_id AS "OrderId", table_label AS "TableLabel",
                   origin AS "Origin", note AS "Note", total_cents AS "TotalCents",
                   created_at AS "CreatedAt"
            FROM sales
            WHERE created_at >= @From AND created_at < @To
            ORDER BY created_at DESC
            """;

        const string itemsSql = """
            SELECT id AS "Id", sale_id AS "SaleId", menu_item_id AS "MenuItemId",
                   name AS "Name", unit_price_cents AS "UnitPriceCents", quantity AS "Quantity"
            FROM sale_items
            WHERE sale_id = ANY(@SaleIds)
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();

        var sales = (await conn.QueryAsync<SaleRow>(salesSql, new { From = from, To = to })).ToList();
        if (sales.Count == 0) return [];

        var saleIds = sales.Select(s => s.Id).ToArray();
        var itemRows = await conn.QueryAsync<SaleItemRow>(itemsSql, new { SaleIds = saleIds });

        var itemsBySale = itemRows
            .GroupBy(i => i.SaleId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(i => new SaleItem(
                    i.Id, i.MenuItemId, i.Name, i.UnitPriceCents, i.Quantity)).ToList());

        return sales
            .Select(s => new Sale(
                s.Id, s.OrderId, s.TableLabel, s.Origin, s.Note, s.TotalCents, s.CreatedAt,
                itemsBySale.GetValueOrDefault(s.Id) ?? []))
            .ToList();
    }

    public async Task<Sale> CreateAsync(SaleInput input)
    {
        const string insertSaleSql = """
            INSERT INTO sales (table_label, origin, note, total_cents, created_at)
            VALUES (@TableLabel, @Origin, @Note, @TotalCents, COALESCE(@CreatedAt, now()))
            RETURNING id AS "Id", order_id AS "OrderId", table_label AS "TableLabel",
                      origin AS "Origin", note AS "Note", total_cents AS "TotalCents",
                      created_at AS "CreatedAt"
            """;

        const string insertItemSql = """
            INSERT INTO sale_items (sale_id, menu_item_id, name, unit_price_cents, quantity)
            VALUES (@SaleId, NULL, @Name, @UnitPriceCents, @Quantity)
            RETURNING id AS "Id", menu_item_id AS "MenuItemId", name AS "Name",
                      unit_price_cents AS "UnitPriceCents", quantity AS "Quantity"
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        await using var tx = await conn.BeginTransactionAsync();

        var sale = await conn.QuerySingleAsync<SaleRow>(insertSaleSql, new
        {
            input.TableLabel,
            input.Origin,
            input.Note,
            input.TotalCents,
            input.CreatedAt,
        }, tx);

        var savedItems = new List<SaleItem>();
        foreach (var item in input.Items)
        {
            var savedItem = await conn.QuerySingleAsync<SaleItem>(insertItemSql, new
            {
                SaleId = sale.Id,
                item.Name,
                item.UnitPriceCents,
                item.Quantity,
            }, tx);
            savedItems.Add(savedItem);
        }

        await tx.CommitAsync();

        return new Sale(
            sale.Id, sale.OrderId, sale.TableLabel, sale.Origin, sale.Note,
            sale.TotalCents, sale.CreatedAt, savedItems);
    }

    private record SaleRow(
        Guid Id,
        Guid? OrderId,
        string TableLabel,
        string Origin,
        string? Note,
        long TotalCents,
        DateTime CreatedAt);

    private record SaleItemRow(
        Guid Id,
        Guid SaleId,
        Guid? MenuItemId,
        string Name,
        long UnitPriceCents,
        int Quantity);
}
