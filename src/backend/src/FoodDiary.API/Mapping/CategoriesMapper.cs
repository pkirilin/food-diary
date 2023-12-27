using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Mapping;

public static class CategoriesMapper
{
    public static CategoryItemDto ToCategoryItemDto(this Category category) => new()
    {
        Id = category.Id,
        Name = category.Name,
        CountProducts = category.Products.Count
    };
}