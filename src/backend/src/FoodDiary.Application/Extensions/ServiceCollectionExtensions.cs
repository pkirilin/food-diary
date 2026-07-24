using System.Reflection;
using System.Runtime.CompilerServices;
using FoodDiary.Application.Categories.Create;
using FoodDiary.Application.Categories.Delete;
using FoodDiary.Application.Categories.Get;
using FoodDiary.Application.Categories.Update;
using FoodDiary.Application.Notes.Create;
using FoodDiary.Application.Notes.Get;
using FoodDiary.Application.Notes.GetHistory;
using FoodDiary.Application.Notes.Recognize;
using FoodDiary.Application.Notes.Update;
using FoodDiary.Application.Products.Create;
using FoodDiary.Application.Products.Delete;
using FoodDiary.Application.Products.Get;
using FoodDiary.Application.Products.SuggestNutrition;
using FoodDiary.Application.Products.Update;
using FoodDiary.Application.Services.Categories;
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
        services.AddCategories();
        services.AddNotes();
        services.AddProducts();
    }

    private static void AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<ICategoriesService, CategoriesService>();
    }

    private static void AddCategories(this IServiceCollection services)
    {
        services.AddScoped<GetCategoriesQueryHandler>();
        services.AddScoped<CreateCategoryCommandHandler>();
        services.AddScoped<UpdateCategoryCommandHandler>();
        services.AddScoped<DeleteCategoryCommandHandler>();
    }

    private static void AddNotes(this IServiceCollection services)
    {
        services.AddScoped<GetNotesQueryHandler>();
        services.AddScoped<GetNotesHistoryQueryHandler>();
        services.AddScoped<CreateNoteCommandHandler>();
        services.AddScoped<UpdateNoteCommandHandler>();
        services.AddScoped<RecognizeNoteCommandHandler>();
    }

    private static void AddProducts(this IServiceCollection services)
    {
        services.AddScoped<SuggestNutritionCommandHandler>();
        services.AddScoped<GetProductsQueryHandler>();
        services.AddScoped<CreateProductCommandHandler>();
        services.AddScoped<UpdateProductCommandHandler>();
        services.AddScoped<DeleteProductCommandHandler>();
        services.AddScoped<DeleteProductsCommandHandler>();
    }
}