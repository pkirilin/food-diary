using System.Linq.Expressions;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;

namespace FoodDiary.ComponentTests;

public abstract class ScenarioBase<TContext> :
    FeatureFixture,
    IClassFixture<FoodDiaryWebApplicationFactory>,
    IAsyncLifetime
{
    private readonly FoodDiaryWebApplicationFactory _factory;
    private readonly Func<TContext> _contextFactory;

    protected ScenarioBase(FoodDiaryWebApplicationFactory factory, Func<TContext> contextFactory)
    {
        _factory = factory;
        _contextFactory = contextFactory;
    }

    protected Task Run(params Expression<Func<TContext, Task>>[] steps) =>
        Runner.WithContext(_contextFactory).RunScenarioAsync(steps);
    
    public async Task InitializeAsync()
    {
        await _factory.ClearDataAsync();
        await _factory.TearDownFakeExternalServices();
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }
}