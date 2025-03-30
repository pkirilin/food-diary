using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.API.Features.Products.Extensions;

public static class ProductsDependencyInjectionExtensions
{
    public static void AddProducts(this IServiceCollection services)
    {
        services.AddScoped<SearchProductsHandler>();
        services.AddScoped<GetProductByIdHandler>();
    }
}