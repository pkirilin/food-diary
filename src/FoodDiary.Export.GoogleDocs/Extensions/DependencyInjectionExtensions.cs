using FoodDiary.Export.GoogleDocs.Implementation;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.Export.GoogleDocs.Extensions;

public static class DependencyInjectionExtensions
{
    public static void AddGoogleDocsExportService(this IServiceCollection services)
    {
        services.AddSingleton<IGoogleDocsExportService, GoogleDocsExportService>();
        services.AddSingleton<IGoogleDriveClient, GoogleDriveClient>();
        services.AddSingleton<IGoogleDocsClient, GoogleDocsClient>();
    }
}