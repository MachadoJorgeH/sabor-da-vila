namespace SaborDaVila.Api.Orders;

public static class OrderStatus
{
    public const string Received = "received";
    public const string Preparing = "preparing";
    public const string Ready = "ready";
    public const string Delivered = "delivered";

    private static readonly Dictionary<string, string> Transitions = new()
    {
        [Received] = Preparing,
        [Preparing] = Ready,
        [Ready] = Delivered
    };

    public static string? Next(string current) =>
        Transitions.TryGetValue(current, out var next) ? next : null;
}