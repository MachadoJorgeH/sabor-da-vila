using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Finance;

public class FinanceService
{
    private const int MaxDays = 366;

    private readonly FinanceRepository _repository;

    public FinanceService(FinanceRepository repository)
    {
        _repository = repository;
    }

    public async Task<FinanceSummary> GetSummaryAsync(DateTime from, DateTime to)
    {
        EnsureRange(from, to);
        var totals = await _repository.SummaryAsync(from, to);
        return new FinanceSummary(
            totals.RevenueCents,
            totals.SalesCount,
            totals.ExpenseCents,
            totals.RevenueCents - totals.ExpenseCents);
    }

    public Task<IReadOnlyList<ChannelRevenue>> GetByChannelAsync(DateTime from, DateTime to)
    {
        EnsureRange(from, to);
        return _repository.ByChannelAsync(from, to);
    }

    public Task<IReadOnlyList<DailyRevenue>> GetDailyAsync(DateOnly from, DateOnly to)
    {
        if (from > to)
            throw new ValidationException("'from' must be on or before 'to'");
        if (to.DayNumber - from.DayNumber > MaxDays)
            throw new ValidationException($"range cannot exceed {MaxDays} days");

        return _repository.DailyAsync(from, to);
    }

    private static void EnsureRange(DateTime from, DateTime to)
    {
        if (from >= to)
            throw new ValidationException("'from' must be earlier than 'to'");
    }
}