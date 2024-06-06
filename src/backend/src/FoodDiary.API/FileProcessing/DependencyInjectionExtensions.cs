using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.API.FileProcessing;

public static class DependencyInjectionExtensions
{
    public static void AddFileProcessing(this IServiceCollection services)
    {
        services.AddSingleton<IImageOptimizer, ImageOptimizer>();
    }
}