using FoodDiary.API.Features.Products.Contracts;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Features.Products.Extensions;

public static class ProductsMappingExtensions
{
    public static GetProductByIdResponse ToGetProductByIdResponse(this Product p)
    {
        return new GetProductByIdResponse
        {
            Id = p.Id,
            Name = p.Name,
            DefaultQuantity = p.DefaultQuantity,
            CaloriesCost = p.CaloriesCost,
            Category = new Contracts.Category
            {
                Id = p.CategoryId,
                Name = p.Category.Name
            }
        };
    }
}