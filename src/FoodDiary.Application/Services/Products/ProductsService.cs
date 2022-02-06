using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Products;

namespace FoodDiary.Application.Services.Products;

internal class ProductsService : IProductsService
{
    public Task<ProductDropdownItemDto[]> GetDropdownItemsAsync(CancellationToken cancellationToken)
    {
        throw new System.NotImplementedException();
    }
}