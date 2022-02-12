using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Products;

namespace FoodDiary.Application.Services.Products;

public interface IProductsService
{
    Task<ProductAutocompleteItemDto[]> GetAutocompleteItemsAsync(CancellationToken cancellationToken);
}