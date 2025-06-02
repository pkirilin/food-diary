using Anthropic;
using FoodDiary.Domain.AI;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FoodDiary.Integrations.Anthropic.Extensions;

public static class AnthropicIntegrationExtensions
{
    public static void AddAnthropicIntegration(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AnthropicOptions>(configuration.GetSection("Integrations:Anthropic"));
        
        services.AddSingleton<AnthropicClient>(provider =>
        {
            var options = provider.GetRequiredService<IOptions<AnthropicOptions>>().Value;
            var httpClientFactory = provider.GetRequiredService<IHttpClientFactory>();
            var httpClient = httpClientFactory.CreateClient(); 

            return new AnthropicClient(
                apiKey: options.ApiKey,
                httpClient,
                baseUri: new Uri(options.BaseUrl));
        });
        
        services.AddKeyedChatClient(LlmProvider.Anthropic, provider => provider.GetRequiredService<AnthropicClient>()
            .AsBuilder()
            .UseLogging(provider.GetRequiredService<ILoggerFactory>())
            .UseFunctionInvocation()
            .Build());
    }
}