using AutoFixture.Xunit2;

namespace FoodDiary.UnitTests.Attributes
{
    class CustomAutoDataAttribute : AutoDataAttribute
    {
        public CustomAutoDataAttribute() : base(() => Fixtures.Custom)
        {
        }
    }
}
