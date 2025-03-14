using FoodDiary.ComponentTests.Infrastructure.DataAccess;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using JetBrains.Annotations;
using LightBDD.Core.Execution;

namespace FoodDiary.ComponentTests.Infrastructure;

[UsedImplicitly]
public class InfrastructureFixture(
    DatabaseFixture database,
    ExternalServicesFixture externalServices) : IAsyncLifetime, IGlobalResourceSetUp
{
    public DatabaseFixture Database => database;
    public ExternalServicesFixture ExternalServices => externalServices;

    public Task InitializeAsync()
    {
        return Task.WhenAll(database.InitializeAsync(), externalServices.InitializeAsync());
    }

    public Task DisposeAsync()
    {
        return Task.WhenAll(database.DisposeAsync(), externalServices.DisposeAsync());
    }

    public Task SetUpAsync()
    {
        return InitializeAsync();
    }

    public Task TearDownAsync()
    {
        return DisposeAsync();
    }
}