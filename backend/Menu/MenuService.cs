using SaborDaVila.Api.Audit;
using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Menu;

public class MenuService
{
    private readonly MenuRepository _repository;
    private readonly AuditService _audit;

    public MenuService(MenuRepository repository, AuditService audit)
    {
        _repository = repository;
        _audit = audit;
    }

    public Task<IReadOnlyList<MenuItem>> ListAsync() => _repository.ListAsync();

    public Task<MenuItem?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

    public async Task<MenuItem> CreateAsync(MenuItemInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var created = await _repository.CreateAsync(input);
        await _audit.RecordAsync("create", "menu", $"created menu item '{created.Name}'");
        return created;
    }

    public async Task<MenuItem?> UpdateAsync(Guid id, MenuItemInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var updated = await _repository.UpdateAsync(id, input);
        if (updated is not null)
            await _audit.RecordAsync("update", "menu", $"updated menu item '{updated.Name}'");
        return updated;
    }

    public async Task<bool> RemoveAsync(Guid id)
    {
        var removed = await _repository.DeactivateAsync(id);
        if (removed)
            await _audit.RecordAsync("delete", "menu", $"removed menu item {id}");
        return removed;
    }
}