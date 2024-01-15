using System.Linq.Expressions;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests;

[Collection(nameof(InfrastructureCollection))]
public abstract class ScenarioBase<TContext>(
    FoodDiaryWebApplicationFactory factory,
    InfrastructureFixture infrastructure)
    : FeatureFixture, IClassFixture<FoodDiaryWebApplicationFactory>, IAsyncLifetime
{
    protected Task Run(params Expression<Func<TContext, Task>>[] steps)
    {
        var context = CreateContext(factory, infrastructure);
        return Runner.WithContext(context).RunScenarioAsync(steps);
    }

    protected abstract TContext CreateContext(
        FoodDiaryWebApplicationFactory factory,
        InfrastructureFixture infrastructure);
    
    public Task InitializeAsync()
    {
        return infrastructure.Database.Clear();
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }
}