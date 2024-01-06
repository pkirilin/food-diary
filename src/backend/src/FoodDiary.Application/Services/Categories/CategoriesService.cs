using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Categories;
using FoodDiary.Domain.Abstractions.v2;

namespace FoodDiary.Application.Services.Categories;

internal class CategoriesService : ICategoriesService
{
    private readonly IFoodDiaryUnitOfWork _unitOfWork;

    public CategoriesService(IFoodDiaryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }
    
    public async Task<CategoryAutocompleteItemDto[]> GetAutocompleteItemsAsync(CancellationToken cancellationToken)
    {
        var categoryEntities = await _unitOfWork.Categories.GetAllOrderedByNameAsync(cancellationToken);
        var categoriesForAutocomplete = categoryEntities.Select(c => c.ToCategoryAutocompleteItemDto()).ToArray();
        return categoriesForAutocomplete;
    }
}