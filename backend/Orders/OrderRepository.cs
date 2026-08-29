using Dapper;
using Npgsql;

namespace SaborDaVila.Api.Orders;

public class OrderRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public OrderRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<Order> CreateAsync(
        string tableLabel,
        string origin,
        string? note,
        IReadOnlyList<OrderItemToCreate> items)
    {
        const string insertOrderSql = """
            INSERT INTO orders (table_label, origin, note)
            VALUES (@TableLabel, @Origin, @Note)
            RETURNING id AS "Id", table_label AS "TableLabel", origin AS "Origin",
                      status AS "Status", note AS "Note",
                      created_at AS "CreatedAt", updated_at AS "UpdatedAt"
            """;

        const string insertItemSql = """
            INSERT INTO order_items (order_id, menu_item_id, name, unit_price_cents, quantity)
            VALUES (@OrderId, @MenuItemId, @Name, @UnitPriceCents, @Quantity)
            RETURNING id AS "Id", menu_item_id AS "MenuItemId", name AS "Name",
                      unit_price_cents AS "UnitPriceCents", quantity AS "Quantity"
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        await using var tx = await conn.BeginTransactionAsync();

        var order = await conn.QuerySingleAsync<OrderRow>(
            insertOrderSql,
            new { TableLabel = tableLabel, Origin = origin, Note = note },
            tx);

        var savedItems = new List<OrderItem>();
        foreach (var item in items)
        {
            var savedItem = await conn.QuerySingleAsync<OrderItem>(
                insertItemSql,
                new
                {
                    OrderId = order.Id,
                    item.MenuItemId,
                    item.Name,
                    item.UnitPriceCents,
                    item.Quantity,
                },
                tx);
            savedItems.Add(savedItem);
        }

        await tx.CommitAsync();

        return new Order(
            order.Id, order.TableLabel, order.Origin, order.Status,
            order.Note, order.CreatedAt, order.UpdatedAt, savedItems);
    }

        public async Task<Order?> GetByIdAsync(Guid id)
    {
        const string orderSql = """
            SELECT id AS "Id", table_label AS "TableLabel", origin AS "Origin",
                   status AS "Status", note AS "Note",
                   created_at AS "CreatedAt", updated_at AS "UpdatedAt"
            FROM orders
            WHERE id = @Id
            """;

        const string itemsSql = """
            SELECT id AS "Id", menu_item_id AS "MenuItemId", name AS "Name",
                   unit_price_cents AS "UnitPriceCents", quantity AS "Quantity"
            FROM order_items
            WHERE order_id = @Id
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();

        var order = await conn.QuerySingleOrDefaultAsync<OrderRow>(orderSql, new { Id = id });
        if (order is null) return null;

        var items = (await conn.QueryAsync<OrderItem>(itemsSql, new { Id = id })).ToList();

        return new Order(
            order.Id, order.TableLabel, order.Origin, order.Status,
            order.Note, order.CreatedAt, order.UpdatedAt, items);
    }

        public async Task<Order> AdvanceStatusAsync(Order order, string nextStatus)
    {
        const string updateStatusSql = """
            UPDATE orders SET status = @Status, updated_at = now()
            WHERE id = @Id
            """;

        const string insertSaleSql = """
            INSERT INTO sales (order_id, table_label, origin, note, total_cents)
            VALUES (@OrderId, @TableLabel, @Origin, @Note, @TotalCents)
            RETURNING id
            """;

        const string insertSaleItemSql = """
            INSERT INTO sale_items (sale_id, menu_item_id, name, unit_price_cents, quantity)
            VALUES (@SaleId, @MenuItemId, @Name, @UnitPriceCents, @Quantity)
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        await using var tx = await conn.BeginTransactionAsync();

        await conn.ExecuteAsync(updateStatusSql, new { Status = nextStatus, order.Id }, tx);

        if (nextStatus == OrderStatus.Delivered)
        {
            var totalCents = order.Items.Sum(i => i.UnitPriceCents * i.Quantity);

            var saleId = await conn.QuerySingleAsync<Guid>(insertSaleSql, new
            {
                OrderId = order.Id,
                order.TableLabel,
                order.Origin,
                order.Note,
                TotalCents = totalCents,
            }, tx);

            foreach (var item in order.Items)
            {
                await conn.ExecuteAsync(insertSaleItemSql, new
                {
                    SaleId = saleId,
                    item.MenuItemId,
                    item.Name,
                    item.UnitPriceCents,
                    item.Quantity,
                }, tx);
            }
        }

        await tx.CommitAsync();

        return order with { Status = nextStatus };
    }

        public async Task<IReadOnlyList<Order>> ListAsync(DateTime since)
    {
        const string ordersSql = """
            SELECT id AS "Id", table_label AS "TableLabel", origin AS "Origin",
                   status AS "Status", note AS "Note",
                   created_at AS "CreatedAt", updated_at AS "UpdatedAt"
            FROM orders
            WHERE created_at >= @Since
            ORDER BY created_at
            """;

        const string itemsSql = """
            SELECT id AS "Id", order_id AS "OrderId", menu_item_id AS "MenuItemId",
                   name AS "Name", unit_price_cents AS "UnitPriceCents", quantity AS "Quantity"
            FROM order_items
            WHERE order_id = ANY(@OrderIds)
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();

        var orders = (await conn.QueryAsync<OrderRow>(ordersSql, new { Since = since })).ToList();
        if (orders.Count == 0) return [];

        var orderIds = orders.Select(o => o.Id).ToArray();
        var itemRows = await conn.QueryAsync<OrderItemRow>(itemsSql, new { OrderIds = orderIds });

        var itemsByOrder = itemRows
            .GroupBy(i => i.OrderId)
            .ToDictionary(
                g => g.Key,
                g => g.Select(i => new OrderItem(
                    i.Id, i.MenuItemId, i.Name, i.UnitPriceCents, i.Quantity)).ToList());

        return orders
            .Select(o => new Order(
                o.Id, o.TableLabel, o.Origin, o.Status, o.Note, o.CreatedAt, o.UpdatedAt,
                itemsByOrder.GetValueOrDefault(o.Id) ?? []))
            .ToList();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        const string sql = "DELETE FROM orders WHERE id = @Id";
        await using var conn = await _dataSource.OpenConnectionAsync();
        var affected = await conn.ExecuteAsync(sql, new { Id = id });
        return affected > 0;
    }

    private record OrderItemRow(
        Guid Id,
        Guid OrderId,
        Guid? MenuItemId,
        string Name,
        long UnitPriceCents,
        int Quantity);

    private record OrderRow(
        Guid Id,
        string TableLabel,
        string Origin,
        string Status,
        string? Note,
        DateTime CreatedAt,
        DateTime UpdatedAt);
}