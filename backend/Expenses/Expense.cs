namespace SaborDaVila.Api.Expenses;

public record Expense(
    Guid Id,
    string Description,
    string Category,
    long AmountCents,
    DateTime CreatedAt
);

public record ExpenseInput(
    string Description,
    string Category,
    long AmountCents
)
{
    private static readonly HashSet<string> ValidCategories =
        new() { "Aluguel", "Fornecedores", "Contas", "Funcionários", "Manutenção", "Outros" };

    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(Description))
            return "description is required";
        if (AmountCents < 0)
            return "amount cannot be negative";
        if (!ValidCategories.Contains(Category))
            return "invalid category";
        return null;
    }
}