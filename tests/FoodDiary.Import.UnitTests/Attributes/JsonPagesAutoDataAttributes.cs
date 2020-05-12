using AutoFixture;
using AutoFixture.Xunit2;
using FoodDiary.Import.UnitTests.Customizations;
using FoodDiary.UnitTests.Customizations;

namespace FoodDiary.Import.UnitTests.Attributes
{
    class JsonPagesWithValidNotesAutoDataAttribute : AutoDataAttribute
    {
        public JsonPagesWithValidNotesAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new JsonPagesWithValidNotesCustomization()))
        {
        }
    }

    class JsonPagesWithDuplicateDisplayOrdersAutoDataAttribute : AutoDataAttribute
    {
        public JsonPagesWithDuplicateDisplayOrdersAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new JsonPagesWithDuplicateDisplayOrdersCustomization()))
        {
        }
    }

    class JsonPagesWithInvalidDisplayOrdersAutoDataAttribute : AutoDataAttribute
    {
        public JsonPagesWithInvalidDisplayOrdersAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new JsonPagesWithInvalidDisplayOrdersCustomization()))
        {
        }
    }

    class JsonPagesWithInvalidMealTypesAutoDataAttribute : AutoDataAttribute
    {
        public JsonPagesWithInvalidMealTypesAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new JsonPagesWithInvalidMealTypesCustomization()))
        {
        }
    }

    class JsonPagesWithInvalidProductQuantitiesAutoDataAttribute : AutoDataAttribute
    {
        public JsonPagesWithInvalidProductQuantitiesAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new JsonPagesWithInvalidProductQuantitiesCustomization()))
        {
        }
    }
}
