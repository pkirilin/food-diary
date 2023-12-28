using FoodDiary.Contracts.Products;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Services.Products;

public static class ProductsServiceMapper
{
    public static ProductAutocompleteItemDto ToProductAutocompleteItemDto(this Product product) =>
        new()
        {
            Id = product.Id,
            Name = product.Name,
            DefaultQuantity = product.DefaultQuantity
        };
}