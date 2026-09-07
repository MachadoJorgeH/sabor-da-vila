namespace SaborDaVila.Api.Storage;

public class PhotoStorage
{
    public const string RequestPath = "/uploads";
    private const long MaxBytes = 5 * 1024 * 1024;
    private static readonly HashSet<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    private readonly string _root;

    public PhotoStorage(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _root = ResolveRoot(configuration, environment);
        Directory.CreateDirectory(_root);
    }

    public string Root => _root;

    public string? Validate(IFormFile file)
    {
        if (file.Length == 0)
            return "file is required";
        if (file.Length > MaxBytes)
            return "file too large (max 5 MB)";
        if (!AllowedExtensions.Contains(Path.GetExtension(file.FileName).ToLowerInvariant()))
            return "invalid file type (use jpg, png or webp)";
        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return "invalid content type";
        return null;
    }

    public async Task<string> SaveAsync(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(_root, fileName);

        await using var stream = File.Create(fullPath);
        await file.CopyToAsync(stream);

        return $"{RequestPath}/{fileName}";
    }

    public void Delete(string? relativeUrl)
    {
        if (string.IsNullOrEmpty(relativeUrl))
            return;

        var fullPath = Path.Combine(_root, Path.GetFileName(relativeUrl));
        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }

    private static string ResolveRoot(IConfiguration configuration, IWebHostEnvironment environment)
    {
        var configured = configuration["Storage:UploadsPath"];
        if (!string.IsNullOrWhiteSpace(configured))
            return configured;

        var volume = Environment.GetEnvironmentVariable("RAILWAY_VOLUME_MOUNT_PATH");
        if (!string.IsNullOrWhiteSpace(volume))
            return Path.Combine(volume, "uploads");

        return Path.Combine(environment.ContentRootPath, "uploads");
    }
}
