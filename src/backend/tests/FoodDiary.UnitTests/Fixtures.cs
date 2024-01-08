using AutoFixture;
using FoodDiary.UnitTests.Customizations;

namespace FoodDiary.UnitTests;

static class Fixtures
{
    public static IFixture Custom =>
        new Fixture().Customize(new FixtureWithCircularReferencesCustomization());
}