using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests;

public abstract class ScenarioBase : IClassFixture<FoodDiaryWebApplicationFactory>
{
    protected readonly FoodDiaryWebApplicationFactory Factory;

    protected ScenarioBase(FoodDiaryWebApplicationFactory factory)
    {
        Factory = factory;
    }
}