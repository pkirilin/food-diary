using System;
using FoodDiary.Integrations.Google.Extensions;
using FoodDiary.IntegrationTests.Dsl.Builders;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.IntegrationTests.Extensions;

public static class WebApplicationFactoryExtensions
{
    public static WebApplicationFactory<T> SetupGoogleOAuthClient<T>(this WebApplicationFactory<T> factory,
        Func<GoogleOAuthClientHandlerBuilder, GoogleOAuthClientHandlerBuilder> func) where T : class
    {
        var handlerBuilder = new GoogleOAuthClientHandlerBuilder();
        var handler = func?.Invoke(handlerBuilder).Please();
        
        return factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureTestServices(services =>
            {
                services.AddGoogleOAuthClient().ConfigurePrimaryHttpMessageHandler(() => handler);
            });
        });
    }
}