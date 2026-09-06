using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Auth;

public class UsersService
{
    private readonly UserRepository _repository;

    public UsersService(UserRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<UserSummary>> ListAsync()
    {
        var users = await _repository.ListAsync();
        return users
            .Select(u => new UserSummary(u.Id, u.Email, u.Name, u.Role, u.CreatedAt))
            .ToList();
    }

    public async Task<UserSummary> CreateAsync(CreateUserInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(input.Password);
        var user = await _repository.CreateAsync(input.Email, passwordHash, input.Name, input.Role);
        return new UserSummary(user.Id, user.Email, user.Name, user.Role, user.CreatedAt);
    }

    public async Task<UserSummary?> UpdateAsync(Guid id, UpdateUserInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var passwordHash = input.Password is null
            ? null
            : BCrypt.Net.BCrypt.HashPassword(input.Password);

        var user = await _repository.UpdateAsync(id, input.Name, input.Role, passwordHash);
        return user is null
            ? null
            : new UserSummary(user.Id, user.Email, user.Name, user.Role, user.CreatedAt);
    }

    public Task<bool> DeleteAsync(Guid id) => _repository.DeleteAsync(id);
}
