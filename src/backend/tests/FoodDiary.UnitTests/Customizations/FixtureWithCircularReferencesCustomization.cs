using AutoFixture;

namespace FoodDiary.UnitTests.Customizations;

public class FixtureWithCircularReferencesCustomization : ICustomization
{
    public void Customize(IFixture fixture)
    {
        fixture.Behaviors.Remove(new ThrowingRecursionBehavior());
        fixture.Behaviors.Add(new OmitOnRecursionBehavior());
    }
}