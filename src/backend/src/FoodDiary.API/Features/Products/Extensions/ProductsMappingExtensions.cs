using System.Linq;
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
            Protein = p.Protein,
            Fats = p.Fats,
            Carbs = p.Carbs,
            Sugar = p.Sugar,
            Salt = p.Salt,
            Category = new Contracts.Category
            {
                Id = p.CategoryId,
                Name = p.Category.Name
            }
        };
    }
    
    public static SearchProductsResponse.Product[] ToResponse(this SearchProductsResult result)
    {
        return result.Products
            .Select(p => p.ToResponseProduct())
            .ToArray();
    }

    private static SearchProductsResponse.Product ToResponseProduct(this Product product)
    {
        return new SearchProductsResponse.Product(
            Id: product.Id,
            Name: product.Name,
            DefaultQuantity: product.DefaultQuantity,
            Calories: product.CaloriesCost,
            Protein: product.Protein,
            Fats: product.Fats,
            Carbs: product.Carbs,
            Sugar: product.Sugar,
            Salt: product.Salt);
    }
}