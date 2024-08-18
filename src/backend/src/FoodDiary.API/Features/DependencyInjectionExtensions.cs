using FoodDiary.API.Features.Notes.Create;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.API.Features;

public static class DependencyInjectionExtensions
{
    public static void AddFeatures(this IServiceCollection services)
    {
        services.AddNotes();
    }

    private static void AddNotes(this IServiceCollection services)
    {
        services.AddScoped<CreateNoteRequestHandler>();
    }
}