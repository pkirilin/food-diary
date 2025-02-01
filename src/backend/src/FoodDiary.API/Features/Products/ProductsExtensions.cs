using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.API.Features.Products;

public static class ProductsExtensions
{
    public static void AddProducts(this IServiceCollection services)
    {
        services.AddScoped<SearchProductsHandler>();
    }
}