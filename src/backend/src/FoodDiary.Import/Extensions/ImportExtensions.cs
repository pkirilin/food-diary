using FoodDiary.Import.Core;
using FoodDiary.Import.Implementation;
using FoodDiary.Import.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.Import.Extensions;

public static class ImportExtensions
{
    /// <summary>
    /// Adds all services related to import
    /// </summary>
    public static void AddPagesJsonImportServices(this IServiceCollection services)
    {
        services.AddTransient<IJsonParser, JsonParser>();
        services.AddTransient<IJsonImporter, JsonImporter>();
        services.AddScoped<IJsonImportDataProvider, JsonImportDataProvider>();
            
        services.AddTransient<IPageJsonImporter, PageJsonImporter>();
        services.AddTransient<INoteJsonImporter, NoteJsonImporter>();
        services.AddTransient<IProductJsonImporter, ProductJsonImporter>();
        services.AddTransient<ICategoryJsonImporter, CategoryJsonImporter>();
    }
}