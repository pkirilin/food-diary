using FoodDiary.API.Dtos;
using FoodDiary.Contracts.Products;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Mapping;

public static class ProductsMapper
{
    public static ProductItemDto ToProductItemDto(this Product product) => new()
    {
        Id = product.Id,
        Name = product.Name,
        CaloriesCost = product.CaloriesCost,
        DefaultQuantity = product.DefaultQuantity,
        CategoryId = product.CategoryId,
        CategoryName = product.Category.Name
    };

    public static CreateProductResponse ToCreateProductResponse(this Product product) => new(product.Id);
}