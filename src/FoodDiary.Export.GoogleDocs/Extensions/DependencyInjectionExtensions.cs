using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.Export.GoogleDocs.Extensions;

public static class DependencyInjectionExtensions
{
    public static void AddGoogleDocsExportService(this IServiceCollection services)
    {
        services.AddGoogleDocsExportService(builder => builder);
    }

    public static void AddGoogleDocsExportService(this IServiceCollection services,
        Func<IGoogleDocsExportServiceBuilder, IGoogleDocsExportServiceBuilder> configure)
    {
        var builder = new GoogleDocsExportServiceBuilder();
        var exportService = configure.Invoke(builder).Build();

        services.AddSingleton(_ => exportService);
    }
}