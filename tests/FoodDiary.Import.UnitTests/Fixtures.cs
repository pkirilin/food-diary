using AutoFixture;

namespace FoodDiary.Import.UnitTests
{
    static class Fixtures
    {
        public static IFixture Custom
        {
            get
            {
                var fixture = new Fixture();
                fixture.Behaviors.Remove(new ThrowingRecursionBehavior());
                fixture.Behaviors.Add(new OmitOnRecursionBehavior());
                return fixture;
            }
        }
    }
}
