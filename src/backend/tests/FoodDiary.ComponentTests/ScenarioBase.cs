using System.Linq.Expressions;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests;

public abstract class ScenarioBase<TContext> : FeatureFixture, IClassFixture<FoodDiaryWebApplicationFactory>, IAsyncLifetime
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
    
    public Task InitializeAsync()
    {
        return _factory.ClearDataAsync();
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }
}