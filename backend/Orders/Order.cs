namespace SaborDaVila.Api.Orders;

public record Order(
    Guid Id,
    string TableLabel,
    string Origin,
    string Status,
    string? Note,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyList<OrderItem> Items
);

public record OrderItem(
    Guid Id,
    Guid? MenuItemId,
    string Name,
    long UnitPriceCents,
    int Quantity
);