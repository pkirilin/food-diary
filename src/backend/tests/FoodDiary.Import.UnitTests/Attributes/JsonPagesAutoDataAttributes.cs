using AutoFixture.Xunit2;
using FoodDiary.Import.UnitTests.Customizations;

namespace FoodDiary.Import.UnitTests.Attributes
{
    class JsonPagesWithValidNotesAutoDataAttribute : AutoDataAttribute
    {
        public JsonPagesWithValidNotesAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new JsonPagesWithValidNotesCustomization()))
        {
        }
    }

    class JsonPagesWithDuplicateDisplayOrdersAutoDataAttribute : AutoDataAttribute
    {
        public JsonPagesWithDuplicateDisplayOrdersAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new JsonPagesWithDuplicateDisplayOrdersCustomization()))
        {
        }
    }

    class JsonPagesWithInvalidDisplayOrdersAutoDataAttribute : AutoDataAttribute
    {
        public JsonPagesWithInvalidDisplayOrdersAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new JsonPagesWithInvalidDisplayOrdersCustomization()))
        {
        }
    }

    class JsonPagesWithInvalidMealTypesAutoDataAttribute : AutoDataAttribute
    {
        public JsonPagesWithInvalidMealTypesAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new JsonPagesWithInvalidMealTypesCustomization()))
        {
        }
    }

    class JsonPagesWithInvalidProductQuantitiesAutoDataAttribute : AutoDataAttribute
    {
        public JsonPagesWithInvalidProductQuantitiesAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new JsonPagesWithInvalidProductQuantitiesCustomization()))
        {
        }
    }
}
