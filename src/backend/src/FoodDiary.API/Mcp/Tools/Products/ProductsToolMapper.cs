using FoodDiary.Application.Products.Get;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Mcp.Tools.Products;

public static class ProductsToolMapper
{
    extension(GetProductsQueryResult result)
    {
        public ListProductsToolResponse ToListProductsToolResponse(int pageNumber, int pageSize)
        {
            return new ListProductsToolResponse(
                Products: [..result.Products.Select(ToResponseProduct)],
                PageNumber: pageNumber,
                PageSize: pageSize,
                TotalCount: result.TotalProductsCount);
        }

        private static ListProductsToolResponse.Product ToResponseProduct(Product product) => new(
            product.Id,
            product.Name,
            new ListProductsToolResponse.ProductCategory(product.Category!.Name),
            product.DefaultQuantity,
            new ListProductsToolResponse.ProductNutrition(
                product.CaloriesCost,
                product.Protein,
                product.Fats,
                product.Carbs,
                product.Sugar,
                product.Salt));
    }
}