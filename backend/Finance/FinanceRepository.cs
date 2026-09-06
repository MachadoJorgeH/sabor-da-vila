using Dapper;
using Npgsql;

namespace SaborDaVila.Api.Finance;

public class FinanceRepository
{
    private readonly NpgsqlDataSource _dataSource;

    public FinanceRepository(NpgsqlDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task<IReadOnlyList<ChannelRevenue>> ByChannelAsync(DateTime from, DateTime to)
    {
        const string sql = """
            SELECT origin AS "Origin",
                   SUM(total_cents)::bigint AS "RevenueCents",
                   COUNT(*)::int AS "SalesCount"
            FROM sales
            WHERE created_at >= @From AND created_at < @To
            GROUP BY origin
            ORDER BY origin
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        var rows = await conn.QueryAsync<ChannelRevenue>(sql, new { From = from, To = to });
        return rows.ToList();
    }

    public async Task<SummaryTotals> SummaryAsync(DateTime from, DateTime to)
    {
        const string sql = """
            SELECT
                (SELECT COALESCE(SUM(total_cents), 0)::bigint
                 FROM sales WHERE created_at >= @From AND created_at < @To) AS "RevenueCents",
                (SELECT COUNT(*)::int
                 FROM sales WHERE created_at >= @From AND created_at < @To) AS "SalesCount",
                (SELECT COALESCE(SUM(amount_cents), 0)::bigint
                 FROM expenses WHERE created_at >= @From AND created_at < @To) AS "ExpenseCents"
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        return await conn.QuerySingleAsync<SummaryTotals>(sql, new { From = from, To = to });
    }

    public async Task<IReadOnlyList<DailyRevenue>> DailyAsync(int days)
    {
        const string sql = """
            WITH day_spine AS (
                SELECT generate_series(
                    (now() AT TIME ZONE 'America/Sao_Paulo')::date - (@Days - 1) * INTERVAL '1 day',
                    (now() AT TIME ZONE 'America/Sao_Paulo')::date,
                    INTERVAL '1 day'
                )::date AS day
            ),
            sales_by_day AS (
                SELECT (created_at AT TIME ZONE 'America/Sao_Paulo')::date AS day,
                       SUM(total_cents)::bigint AS revenue_cents,
                       COUNT(*)::int AS sales_count
                FROM sales
                GROUP BY 1
            ),
            expenses_by_day AS (
                SELECT (created_at AT TIME ZONE 'America/Sao_Paulo')::date AS day,
                       SUM(amount_cents)::bigint AS expense_cents
                FROM expenses
                GROUP BY 1
            )
            SELECT sp.day AS "Day",
                   COALESCE(sd.revenue_cents, 0)::bigint AS "RevenueCents",
                   COALESCE(sd.sales_count, 0)::int AS "SalesCount",
                   COALESCE(ed.expense_cents, 0)::bigint AS "ExpenseCents"
            FROM day_spine sp
            LEFT JOIN sales_by_day sd ON sd.day = sp.day
            LEFT JOIN expenses_by_day ed ON ed.day = sp.day
            ORDER BY sp.day
            """;

        await using var conn = await _dataSource.OpenConnectionAsync();
        var rows = await conn.QueryAsync<DailyRevenue>(sql, new { Days = days });
        return rows.ToList();
    }
}