using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests;

public abstract class ScenarioBase<TContext> : FeatureFixture, IClassFixture<FoodDiaryWebApplicationFactory>
{
    protected readonly Func<TContext> ContextFactory;

    protected ScenarioBase(Func<TContext> contextFactory)
    {
        ContextFactory = contextFactory;
    }
}