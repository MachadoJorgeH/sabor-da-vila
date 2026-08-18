namespace SaborDaVila.Api.Menu;

public record MenuItem(
    Guid Id,
    string Name,
    long PriceCents,
    string Category,
    string? PhotoUrl,
    bool Active,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record MenuItemInput(
    string Name,
    long PriceCents,
    string Category,
    string? PhotoUrl
)
{
    private static readonly HashSet<string> ValidCategories = new() { "Lanches", "Bebidas", "Sobremesas", "Pizzas", "Prato Feito"};

    public string? Validate()
    {
        if(string.IsNullOrWhiteSpace(Name))
            return "name is required";
        if(PriceCents < 0)
            return "price cannot be negative";
        if(!ValidCategories.Contains(Category))
            return "invalid category";
        return null;
    }
}