using SaborDaVila.Api.Audit;
using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Expenses;

public class ExpenseService
{
    private readonly ExpenseRepository _repository;
    private readonly AuditService _audit;

    public ExpenseService(ExpenseRepository repository, AuditService audit)
    {
        _repository = repository;
        _audit = audit;
    }

    public Task<IReadOnlyList<Expense>> ListAsync() => _repository.ListAsync();

    public Task<Expense?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

    public async Task<Expense> CreateAsync(ExpenseInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var created = await _repository.CreateAsync(input);
        await _audit.RecordAsync("create", "expense", $"created expense '{created.Description}'");
        return created;
    }

    public async Task<Expense?> UpdateAsync(Guid id, ExpenseInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var updated = await _repository.UpdateAsync(id, input);
        if (updated is not null)
            await _audit.RecordAsync("update", "expense", $"updated expense '{updated.Description}'");
        return updated;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (deleted)
            await _audit.RecordAsync("delete", "expense", $"deleted expense {id}");
        return deleted;
    }
}