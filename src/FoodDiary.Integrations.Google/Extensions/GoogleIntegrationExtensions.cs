using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.Integrations.Google.Extensions;

public static class GoogleIntegrationExtensions
{
    public static void AddGoogleIntegration(this IServiceCollection services)
    {
        services.AddSingleton<IGoogleOAuthClient, GoogleOAuthClient>();
    }
}