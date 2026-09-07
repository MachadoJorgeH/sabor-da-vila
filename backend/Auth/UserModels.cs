namespace SaborDaVila.Api.Auth;

public record UserSummary(
    Guid Id,
    string Email,
    string Name,
    string Role,
    DateTime CreatedAt
);

public record CreateUserInput(
    string Email,
    string Password,
    string Name,
    string Role
)
{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(Email))
            return "email is required";
        if (string.IsNullOrWhiteSpace(Password) || Password.Length < 6)
            return "password must have at least 6 characters";
        if (string.IsNullOrWhiteSpace(Name))
            return "name is required";
        if (Role != "admin" && Role != "operator")
            return "invalid role";
        return null;
    }
}

public record UpdateUserInput(
    string Name,
    string Role,
    string? Password
)
{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(Name))
            return "name is required";
        if (Role != "admin" && Role != "operator")
            return "invalid role";
        if (Password is not null && Password.Length < 6)
            return "password must have at least 6 characters";
        return null;
    }
}
