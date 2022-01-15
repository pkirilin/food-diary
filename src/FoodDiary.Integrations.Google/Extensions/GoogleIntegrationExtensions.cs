using FoodDiary.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FoodDiary.Integrations.Google.Extensions;

public static class GoogleIntegrationExtensions
{
    public static void AddGoogleIntegration(this IServiceCollection services)
    {
        services.AddHttpClient<IGoogleOAuthClient, GoogleOAuthClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<GoogleApiOptions>>();
            client.BaseAddress = new Uri(options.Value.BaseUrl);
        });
    }
}