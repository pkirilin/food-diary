using FoodDiary.ComponentTests.Infrastructure;
using LightBDD.Framework;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests;

[CollectionDefinition(nameof(InfrastructureCollection))]
public class InfrastructureCollection : ICollectionFixture<InfrastructureFixture>;

[Collection(nameof(InfrastructureCollection))]
public abstract class BaseTest<TContext>(InfrastructureFixture infrastructure) : FeatureFixture, IAsyncLifetime
    where TContext : notnull
{
    protected IBddRunner<TContext> CtxRunner
    {
        get
        {
            using var scope = infrastructure.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<TContext>();
            return Runner.WithContext(context);
        }
    }

    public Task InitializeAsync()
    {
        return infrastructure.Database.Clear();
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }
}