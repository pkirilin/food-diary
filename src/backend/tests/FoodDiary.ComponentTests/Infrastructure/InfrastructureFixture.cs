using FoodDiary.ComponentTests.Infrastructure.DataAccess;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using JetBrains.Annotations;

namespace FoodDiary.ComponentTests.Infrastructure;

[UsedImplicitly]
public class InfrastructureFixture : IAsyncLifetime
{
    public DatabaseFixture Database { get; } = new();
    public ExternalServicesFixture ExternalServices { get; } = new();
    
    public async Task InitializeAsync()
    {
        await Database.InitializeAsync();
        await ExternalServices.InitializeAsync();
    }

    public async Task DisposeAsync()
    {
        await Database.DisposeAsync();
        await ExternalServices.DisposeAsync();
    }
}