using FoodDiary.API;
using FoodDiary.Export.GoogleDocs;
using MbDotNet;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

public static class FakeExternalServicesExtensions
{
    public static void AddFakeExternalServices(this IServiceCollection services)
    {
        services.AddSingleton<IClient>(_ => new MountebankClient(new Uri("http://localhost:2525", UriKind.Absolute)));
        services.AddSingleton<GoogleIdentityProvider>();
        services.AddSingleton<IGoogleDriveClient, FakeGoogleDriveClient>();
        services.AddSingleton<IGoogleDocsClient, FakeGoogleDocsClient>();
    }
    
    public static Task SetupFakeExternalServices(this WebApplicationFactory<Startup> factory)
    {
        return factory.Services
            .GetRequiredService<GoogleIdentityProvider>()
            .Setup();
    }
}