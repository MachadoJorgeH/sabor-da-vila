using SaborDaVila.Api.Common;
using SaborDaVila.Api.Menu;

namespace SaborDaVila.Api.Orders;

public class OrderService
{
    private readonly OrderRepository _repository;
    private readonly MenuRepository _menuRepository;

    public OrderService(OrderRepository repository, MenuRepository menuRepository)
    {
        _repository = repository;
        _menuRepository = menuRepository;
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

        return await _repository.CreateAsync(
            input.TableLabel, input.Origin, input.Note, itemsToCreate);
    }

        public Task<Order?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

    public async Task<Order> AdvanceStatusAsync(Guid id)
    {
        var order = await _repository.GetByIdAsync(id) ?? throw new NotFoundException("order not found");
        var nextStatus = OrderStatus.Next(order.Status) ?? throw new ValidationException("order is already delivered");
        return await _repository.AdvanceStatusAsync(order, nextStatus);
    }

    public Task<IReadOnlyList<Order>> ListAsync(DateTime since) => _repository.ListAsync(since);

    public Task<bool> RemoveAsync(Guid id) => _repository.DeleteAsync(id);
}