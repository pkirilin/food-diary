using FoodDiary.ComponentTests.Infrastructure.DataAccess;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using JetBrains.Annotations;

namespace FoodDiary.ComponentTests.Infrastructure;

[UsedImplicitly]
public class InfrastructureFixture : IAsyncLifetime
{
    public DatabaseFixture Database { get; } = new();
    public ExternalServicesFixture ExternalServices { get; } = new();
    
    public Task InitializeAsync()
    {
        return Task.WhenAll(Database.InitializeAsync(), ExternalServices.InitializeAsync());
    }

    public Task DisposeAsync()
    {
        return Task.WhenAll(Database.DisposeAsync(), ExternalServices.DisposeAsync());
    }
}