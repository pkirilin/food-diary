using System.ClientModel;
using System.Diagnostics.CodeAnalysis;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using OpenAI;

namespace FoodDiary.Integrations.OpenAI.Extensions;

public static class DependencyInjectionExtensions
{
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    public static void AddOpenAIIntegration(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<OpenAIOptions>(configuration.GetSection("Integrations:OpenAI"));

        services.AddSingleton<OpenAIClient>(provider =>
        {
            var options = provider.GetRequiredService<IOptions<OpenAIOptions>>().Value;
            var clientCredential = new ApiKeyCredential(options.ApiKey);
            var clientOptions = new OpenAIClientOptions { Endpoint = new Uri(options.BaseUrl) };
            var client = new OpenAIClient(clientCredential, clientOptions);
            return client;
        });

        services.AddChatClient(provider => provider.GetRequiredService<OpenAIClient>()
            .AsChatClient("gpt-4o")
            .AsBuilder()
            .Build());
    }
}