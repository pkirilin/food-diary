using FoodDiary.Contracts.Categories;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Services.Categories;

public static class CategoriesServiceMapper
{
    public static CategoryAutocompleteItemDto ToCategoryAutocompleteItemDto(this Category category) => new()
    {
        Id = category.Id,
        Name = category.Name
    };
}