using FoodDiary.Contracts.Categories;

namespace FoodDiary.Application.Services.Categories;

public interface ICategoriesService
{
    Task<CategoryAutocompleteItemDto[]> GetAutocompleteItemsAsync(CancellationToken cancellationToken);
}