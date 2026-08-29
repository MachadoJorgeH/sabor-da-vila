namespace SaborDaVila.Api.Orders;

public record OrderInput(
    string TableLabel,
    string Origin,
    string? Note,
    IReadOnlyList<OrderItemInput> Items
)

{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(TableLabel))
            return "table is required";
        if (Origin != "hall" && Origin != "app")
            return "invalid origin";
        if (Items is null || Items.Count == 0)
            return "order must have at least one item";
        foreach (var item in Items)
            if (item.Quantity <= 0)
                return "item quantity must be positive";
        return null;
    }
}

public record OrderItemInput(
    Guid MenuItemId,
    int Quantity
);

public record OrderItemToCreate(
    Guid? MenuItemId,
    string Name,
    long UnitPriceCents,
    int Quantity
);