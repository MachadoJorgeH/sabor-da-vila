using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Inventory;

public class InventoryService
{
    private readonly InventoryRepository _repository;

    public InventoryService(InventoryRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<InventoryItem>> ListAsync() => _repository.ListAsync();

    public Task<InventoryItem?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

    public Task<InventoryItem> CreateAsync(InventoryItemInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        return _repository.CreateAsync(input);
    }

    public Task<InventoryItem?> UpdateAsync(Guid id, InventoryItemInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        return _repository.UpdateAsync(id, input);
    }

    public Task<bool> DeleteAsync(Guid id) => _repository.DeleteAsync(id);
}