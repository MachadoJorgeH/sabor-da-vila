using System.Security.Claims;

namespace SaborDaVila.Api.Audit;

public class AuditService
{
    private readonly AuditRepository _repository;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditService(AuditRepository repository, IHttpContextAccessor httpContextAccessor)
    {
        _repository = repository;
        _httpContextAccessor = httpContextAccessor;
    }

    public Task RecordAsync(string action, string entity, string description)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        var userEmail = user?.FindFirstValue("email") ?? "system";
        Guid? userId = Guid.TryParse(user?.FindFirstValue("sub"), out var parsed) ? parsed : null;

        return _repository.RecordAsync(action, entity, description, userId, userEmail);
    }

    public Task<IReadOnlyList<AuditLogEntry>> ListAsync(int limit) => _repository.ListAsync(limit);
}