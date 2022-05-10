using FoodDiary.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FoodDiary.Integrations.Google.Extensions;

public static class GoogleIntegrationExtensions
{
    public static IHttpClientBuilder AddGoogleOAuthClient(this IServiceCollection services)
    {
        return services.AddHttpClient<IGoogleOAuthClient, GoogleOAuthClient>((provider, client) =>
        {
            var options = provider.GetRequiredService<IOptions<GoogleOptions>>();
            client.BaseAddress = new Uri(options.Value.BaseUrl);
        });
    }
}