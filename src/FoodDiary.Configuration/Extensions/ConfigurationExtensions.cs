using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.Configuration.Extensions;

public static class ConfigurationExtensions
{
    public static void ConfigureCustomOptions(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AuthOptions>(configuration.GetSection("Auth"));
        services.Configure<GoogleApiOptions>(configuration.GetSection("GoogleApi"));
    }
}