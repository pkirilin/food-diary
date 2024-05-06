using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Products;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Services.Products;

internal class ProductsService(IProductsRepository repository) : IProductsService
{
    public async Task<ProductAutocompleteItemDto[]> GetAutocompleteItemsAsync(CancellationToken cancellationToken)
    {
        var products = await repository.GetAllOrderedByNameAsync(cancellationToken);

        return products
            .Select(p => p.ToProductAutocompleteItemDto())
            .ToArray();
    }
}