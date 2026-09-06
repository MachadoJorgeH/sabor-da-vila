using SaborDaVila.Api.Audit;
using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Inventory;

public class InventoryService
{
    private readonly InventoryRepository _repository;
    private readonly AuditService _audit;

    public InventoryService(InventoryRepository repository, AuditService audit)
    {
        _repository = repository;
        _audit = audit;
    }

    public Task<IReadOnlyList<InventoryItem>> ListAsync() => _repository.ListAsync();

    public Task<InventoryItem?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

    public async Task<InventoryItem> CreateAsync(InventoryItemInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var created = await _repository.CreateAsync(input);
        await _audit.RecordAsync("create", "inventory", $"repôs '{created.Name}' no estoque");
        return created;
    }

    public async Task<InventoryItem?> UpdateAsync(Guid id, InventoryItemInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var updated = await _repository.UpdateAsync(id, input);
        if (updated is not null)
            await _audit.RecordAsync("update", "inventory", $"atualizou '{updated.Name}' no estoque");
        return updated;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (deleted)
            await _audit.RecordAsync("delete", "inventory", $"removeu um item do estoque ({id})");
        return deleted;
    }
}