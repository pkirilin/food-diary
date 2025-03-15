using FoodDiary.ComponentTests.Infrastructure.DataAccess;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using FoodDiary.ComponentTests.Scenarios.Notes;
using JetBrains.Annotations;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure;

[UsedImplicitly]
public class InfrastructureFixture : IAsyncLifetime, IDisposable
{
    public ServiceProvider Services { get; } = ConfigureServices();
    public DatabaseFixture Database => Services.GetRequiredService<DatabaseFixture>();
    public ExternalServicesFixture ExternalServices => Services.GetRequiredService<ExternalServicesFixture>();

    private static ServiceProvider ConfigureServices()
    {
        var services = new ServiceCollection();

        services.AddScoped<NotesApiContext>();
        
        return services
            .AddSingleton<FoodDiaryWebApplicationFactory>()
            .AddSingleton<DatabaseFixture>()
            .AddSingleton<ExternalServicesFixture>()
            .BuildServiceProvider();
    }
    
    public Task InitializeAsync()
    {
        return Task.WhenAll(Database.Start(), ExternalServices.Start());
    }

    public Task DisposeAsync()
    {
        return Task.WhenAll(Database.Stop(), ExternalServices.Stop());
    }

    public void Dispose()
    {
        Services.Dispose();
    }
}