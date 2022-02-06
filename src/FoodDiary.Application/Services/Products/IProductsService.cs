using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Products;

namespace FoodDiary.Application.Services.Products;

public interface IProductsService
{
    Task<ProductDropdownItemDto[]> GetDropdownItemsAsync(CancellationToken cancellationToken);
}