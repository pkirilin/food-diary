using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Products;
using FoodDiary.Domain.Abstractions.v2;

namespace FoodDiary.Application.Services.Products;

internal class ProductsService : IProductsService
{
    private readonly IFoodDiaryUnitOfWork _unitOfWork;

    public ProductsService(IFoodDiaryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    
    public async Task<ProductDropdownItemDto[]> GetDropdownItemsAsync(CancellationToken cancellationToken)
    {
        var products = await _unitOfWork.Products.GetAllOrderedByNameAsync(cancellationToken);

        var dropdownItems = products.Select(p => new ProductDropdownItemDto
            {
                Id = p.Id,
                Name = p.Name
            })
            .ToArray();

        return dropdownItems;
    }
}