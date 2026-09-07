namespace SaborDaVila.Api.Sales;

public record Sale(
    Guid Id,
    Guid? OrderId,
    string TableLabel,
    string Origin,
    string? Note,
    long TotalCents,
    DateTime CreatedAt,
    IReadOnlyList<SaleItem> Items
);

public record SaleItem(
    Guid Id,
    Guid? MenuItemId,
    string Name,
    long UnitPriceCents,
    int Quantity
);

public record SaleInput(
    string TableLabel,
    string Origin,
    string? Note,
    long TotalCents,
    DateTime? CreatedAt,
    IReadOnlyList<SaleItemInput> Items
)
{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(TableLabel))
            return "table is required";
        if (Origin != "hall" && Origin != "app")
            return "invalid origin";
        if (TotalCents < 0)
            return "total cannot be negative";
        if (Items is null || Items.Count == 0)
            return "sale must have at least one item";
        return null;
    }
}

public record SaleItemInput(
    string Name,
    long UnitPriceCents,
    int Quantity
);
