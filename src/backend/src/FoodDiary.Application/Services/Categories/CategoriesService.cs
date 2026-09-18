using FoodDiary.Contracts.Categories;
using FoodDiary.Domain.Abstractions.v2;

namespace FoodDiary.Application.Services.Categories;

internal class CategoriesService(IFoodDiaryUnitOfWork unitOfWork) : ICategoriesService
{
    public async Task<CategoryAutocompleteItemDto[]> GetAutocompleteItemsAsync(CancellationToken cancellationToken)
    {
        var categoryEntities = await unitOfWork.Categories.GetAllOrderedByNameAsync(cancellationToken);
        var categoriesForAutocomplete = categoryEntities.Select(c => c.ToCategoryAutocompleteItemDto()).ToArray();
        return categoriesForAutocomplete;
    }
}