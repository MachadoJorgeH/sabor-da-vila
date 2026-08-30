namespace SaborDaVila.Api.Finance;

public record ChannelRevenue(
    string Origin,
    long RevenueCents,
    int SalesCount);

public record DailyRevenue(
    DateOnly Day,
    long RevenueCents,
    int SalesCount);

public record FinanceSummary(
    long RevenueCents,
    int SalesCount,
    long ExpenseCents,
    long NetCents);

public record SummaryTotals(
    long RevenueCents,
    int SalesCount,
    long ExpenseCents
);