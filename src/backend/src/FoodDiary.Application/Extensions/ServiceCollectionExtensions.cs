using System.Reflection;
using System.Runtime.CompilerServices;
using FoodDiary.Application.Notes.Create;
using FoodDiary.Application.Notes.Get;
using FoodDiary.Application.Notes.Update;
using FoodDiary.Application.Services.Categories;
using FoodDiary.Application.Services.Export;
using FoodDiary.Application.Services.Products;
using FoodDiary.Export.GoogleDocs.Extensions;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

[assembly:InternalsVisibleTo("FoodDiary.UnitTests")]

namespace FoodDiary.Application.Extensions;

public static class ServiceCollectionExtensions
{
    public static void AddApplicationDependencies(this IServiceCollection services)
    {
        services.AddMediatR(Assembly.GetExecutingAssembly());
        services.AddApplicationServices();
        services.AddNotes();
    }

    private static void AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IProductsService, ProductsService>();
        services.AddScoped<ICategoriesService, CategoriesService>();

        services.AddScoped<IExportService, ExportService>();
        services.AddScoped<IExportDataLoader, ExportDataLoader>();
        services.AddGoogleDocsExportService();
    }
    
    private static void AddNotes(this IServiceCollection services)
    {
        services.AddScoped<GetNotesQueryHandler>();
        services.AddScoped<CreateNoteCommandHandler>();
        services.AddScoped<UpdateNoteCommandHandler>();
    }
}