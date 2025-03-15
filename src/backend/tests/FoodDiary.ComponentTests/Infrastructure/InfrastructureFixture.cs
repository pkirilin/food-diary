using FoodDiary.ComponentTests.Infrastructure.DataAccess;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using FoodDiary.ComponentTests.Scenarios.Auth;
using FoodDiary.ComponentTests.Scenarios.Categories;
using FoodDiary.ComponentTests.Scenarios.ErrorHandling;
using FoodDiary.ComponentTests.Scenarios.Notes;
using FoodDiary.ComponentTests.Scenarios.Products;
using FoodDiary.ComponentTests.Scenarios.WeightTracking;
using JetBrains.Annotations;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure;

[UsedImplicitly]
public class InfrastructureFixture : IAsyncLifetime, IDisposable
{
    public ServiceProvider Services { get; } = ConfigureServices();
    
    public DatabaseFixture Database => Services.GetRequiredService<DatabaseFixture>();
    private ExternalServicesFixture ExternalServices => Services.GetRequiredService<ExternalServicesFixture>();

    private static ServiceProvider ConfigureServices()
    {
        var services = new ServiceCollection();

        services
            .AddScoped<AuthContext>()
            .AddScoped<ErrorHandlingContext>()
            .AddScoped<CategoriesApiContext>()
            .AddScoped<NotesApiContext>()
            .AddScoped<ProductsApiContext>()
            .AddScoped<WeightLogsApiContext>();

        services
            .AddSingleton<FoodDiaryWebApplicationFactory>()
            .AddSingleton<DatabaseFixture>()
            .AddSingleton<ExternalServicesFixture>();
        
        return services.BuildServiceProvider();
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