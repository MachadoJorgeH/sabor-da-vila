using SaborDaVila.Api.Audit;
using SaborDaVila.Api.Common;
using SaborDaVila.Api.Storage;

namespace SaborDaVila.Api.Menu;

public class MenuService
{
    private readonly MenuRepository _repository;
    private readonly AuditService _audit;
    private readonly PhotoStorage _photos;

    public MenuService(MenuRepository repository, AuditService audit, PhotoStorage photos)
    {
        _repository = repository;
        _audit = audit;
        _photos = photos;
    }

    public Task<IReadOnlyList<MenuItem>> ListAsync() => _repository.ListAsync();

    public Task<MenuItem?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

    public async Task<MenuItem> CreateAsync(MenuItemInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var created = await _repository.CreateAsync(input);
        await _audit.RecordAsync("create", "menu", $"adicionou '{created.Name}' ao cardápio");
        return created;
    }

    public async Task<MenuItem?> UpdateAsync(Guid id, MenuItemInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var updated = await _repository.UpdateAsync(id, input);
        if (updated is not null)
            await _audit.RecordAsync("update", "menu", $"atualizou '{updated.Name}' no cardápio");
        return updated;
    }

    public async Task<bool> RemoveAsync(Guid id)
    {
        var removed = await _repository.DeactivateAsync(id);
        if (removed)
            await _audit.RecordAsync("delete", "menu", $"removeu um item do cardápio ({id})");
        return removed;
    }

    public async Task<MenuItem?> SetPhotoAsync(Guid id, IFormFile file)
    {
        var error = _photos.Validate(file);
        if (error is not null)
            throw new ValidationException(error);

        var item = await _repository.GetByIdAsync(id);
        if (item is null)
            return null;

        var url = await _photos.SaveAsync(file);
        var updated = await _repository.UpdatePhotoAsync(id, url);
        _photos.Delete(item.PhotoUrl);
        await _audit.RecordAsync("update", "menu", $"trocou a foto de '{item.Name}'");
        return updated;
    }

    public async Task<MenuItem?> RemovePhotoAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id);
        if (item is null)
            return null;
        if (item.PhotoUrl is null)
            return item;

        var updated = await _repository.UpdatePhotoAsync(id, null);
        _photos.Delete(item.PhotoUrl);
        await _audit.RecordAsync("update", "menu", $"removeu a foto de '{item.Name}'");
        return updated;
    }
}