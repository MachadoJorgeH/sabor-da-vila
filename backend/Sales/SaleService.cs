using SaborDaVila.Api.Common;

namespace SaborDaVila.Api.Sales;

public class SaleService
{
    private readonly SaleRepository _repository;

    public SaleService(SaleRepository repository)
    {
        _repository = repository;
    }

    public Task<IReadOnlyList<Sale>> ListAsync(DateTime from, DateTime to) =>
        _repository.ListAsync(from, to);

    public async Task<Sale> CreateAsync(SaleInput input)
    {
        var error = input.Validate();
        if (error is not null)
            throw new ValidationException(error);

        return await _repository.CreateAsync(input);
    }
}
