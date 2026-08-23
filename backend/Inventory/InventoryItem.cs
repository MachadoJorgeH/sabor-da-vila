namespace SaborDaVila.Api.Inventory;

public record InventoryItem(
    Guid Id,
    string Name,
    decimal Quantity,
    string Unit,
    long CostCents,
    DateTime CreatedAt
);

public record InventoryItemInput(
    string Name,
    decimal Quantity,
    string Unit,
    long CostCents
)
{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(Name))
            return "name is required";
        if (Quantity < 0)
            return "quantity cannot be negative";
        if (string.IsNullOrWhiteSpace(Unit))
            return "unit is required";
        if (CostCents < 0)
            return "cost cannot be negative";
        return null;
    }
}