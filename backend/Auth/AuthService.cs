using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace SaborDaVila.Api.Auth;

public class AuthService
{
    private readonly UserRepository _repository;
    private readonly JwtOptions _jwtOptions;

    public AuthService(UserRepository repository, IOptions<JwtOptions> jwtOptions)
    {
        _repository = repository;
        _jwtOptions = jwtOptions.Value;
    }

    public async Task<LoginResult> LoginAsync(LoginInput input)
    {
        var user = await _repository.GetByEmailAsync(input.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(input.Password, user.PasswordHash))
            throw new InvalidCredentialsException();

        var (token, expiresAt) = GenerateToken(user);
        return new LoginResult(token, expiresAt,
            new UserInfo(user.Id, user.Email, user.Name, user.Role));
    }

    public async Task<User> CreateUserAsync(string email, string password, string name, string role)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
        return await _repository.CreateAsync(email, passwordHash, name, role);
    }

    private (string Token, DateTime ExpiresAt) GenerateToken(User user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpirationMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("role", user.Role),
            new Claim("name", user.Name)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}