using AutoFixture;
using AutoFixture.Xunit2;
using FoodDiary.Import.UnitTests.Customizations;
using FoodDiary.UnitTests;

namespace FoodDiary.Import.UnitTests.Attributes
{
    class JsonObjectWithUniquePagesAutoDataAttribute : AutoDataAttribute
    {
        public JsonObjectWithUniquePagesAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new JsonObjectWithUniquePagesCustomization()))
        {
        }
    }

    class JsonObjectWithNullPagesAutoDataAttribute : AutoDataAttribute
    {
        public JsonObjectWithNullPagesAutoDataAttribute() : base(() => new Fixture()
            .Customize(new JsonObjectWithNullPagesCustomization()))
        {
        }
    }

    class JsonObjectWithDuplicatePageDatesAutoDataAttribute : AutoDataAttribute
    {
        public JsonObjectWithDuplicatePageDatesAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new JsonObjectWithDuplicatePageDatesCustomization()))
        {
        }
    }
}
