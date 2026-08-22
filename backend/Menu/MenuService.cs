namespace SaborDaVila.Api.Menu;
using SaborDaVila.Api.Common;

public class MenuService
{
    private readonly MenuRepository _repository;

    public MenuService(MenuRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<MenuItem>> ListAsync() => _repository.ListAsync();

    public Task<MenuItem?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

    public Task<MenuItem> CreateAsync(MenuItemInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);
        return _repository.CreateAsync(input);
    }

    public Task<MenuItem?> UpdateAsync(Guid id, MenuItemInput input)
    {
        var error = input.Validate();
        if(error is not null)
            throw new ValidationException(error);

        return _repository.UpdateAsync(id, input);
    }

    public Task<bool> RemoveAsync(Guid id) => _repository.DeactivateAsync(id);
}