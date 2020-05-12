using AutoFixture;
using AutoFixture.Xunit2;
using FoodDiary.Import.UnitTests.Customizations;
using FoodDiary.UnitTests.Customizations;

namespace FoodDiary.Import.UnitTests.Attributes
{
    class JsonNotesWithValidInfoAutoDataAttribute : AutoDataAttribute
    {
        public JsonNotesWithValidInfoAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new JsonNotesWithValidInfoCustomization()))
        {
        }
    }

    class JsonNotesWithInvalidProductAutoDataAttribute : AutoDataAttribute
    {
        public JsonNotesWithInvalidProductAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new JsonNotesWithInvalidProductCustomization()))
        {
        }
    }

    class JsonNotesWithInvalidCategoryAutoDataAttribute : AutoDataAttribute
    {
        public JsonNotesWithInvalidCategoryAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new JsonNotesWithInvalidCategoryCustomization()))
        {
        }
    }
}
