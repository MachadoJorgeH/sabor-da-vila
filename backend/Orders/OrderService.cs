using Microsoft.AspNetCore.SignalR;
using SaborDaVila.Api.Common;
using SaborDaVila.Api.Menu;

namespace SaborDaVila.Api.Orders;

public class OrderService
{
    private readonly OrderRepository _repository;
    private readonly MenuRepository _menuRepository;
    private readonly IHubContext<OrdersHub> _hub;

    public OrderService(
        OrderRepository repository,
        MenuRepository menuRepository,
        IHubContext<OrdersHub> hub)
    {
        _repository = repository;
        _menuRepository = menuRepository;
        _hub = hub;
    }

    public async Task<Order> CreateAsync(OrderInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        var itemsToCreate = new List<OrderItemToCreate>();
        foreach (var itemInput in input.Items)
        {
            var menuItem = await _menuRepository.GetByIdAsync(itemInput.MenuItemId);
            if (menuItem is null || !menuItem.Active)
                throw new ValidationException($"menu item not available: {itemInput.MenuItemId}");

            itemsToCreate.Add(new OrderItemToCreate(
                menuItem.Id,
                menuItem.Name,
                menuItem.PriceCents,
                itemInput.Quantity));
        }

        var order = await _repository.CreateAsync(
            input.TableLabel, input.Origin, input.Note, itemsToCreate);
        await _hub.Clients.All.SendAsync("OrdersChanged");
        return order;
    }

    public Task<Order?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

    public async Task<Order> AdvanceStatusAsync(Guid id)
    {
        var order = await _repository.GetByIdAsync(id) ?? throw new NotFoundException("order not found");
        var nextStatus = OrderStatus.Next(order.Status) ?? throw new ValidationException("order is already delivered");
        var updated = await _repository.AdvanceStatusAsync(order, nextStatus);
        await _hub.Clients.All.SendAsync("OrdersChanged");
        return updated;
    }

    public Task<IReadOnlyList<Order>> ListAsync(DateTime since) => _repository.ListAsync(since);

    public async Task<bool> RemoveAsync(Guid id)
    {
        var removed = await _repository.DeleteAsync(id);
        if (removed)
            await _hub.Clients.All.SendAsync("OrdersChanged");
        return removed;
    }
}
