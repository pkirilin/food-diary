using AutoFixture.Xunit2;
using FoodDiary.Import.UnitTests.Customizations;
using FoodDiary.UnitTests;

namespace FoodDiary.Import.UnitTests.Attributes
{
    class JsonNotesWithValidInfoAutoDataAttribute : AutoDataAttribute
    {
        public JsonNotesWithValidInfoAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new JsonNotesWithValidInfoCustomization()))
        {
        }
    }

    class JsonNotesWithInvalidProductAutoDataAttribute : AutoDataAttribute
    {
        public JsonNotesWithInvalidProductAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new JsonNotesWithInvalidProductCustomization()))
        {
        }
    }

    class JsonNotesWithInvalidCategoryAutoDataAttribute : AutoDataAttribute
    {
        public JsonNotesWithInvalidCategoryAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new JsonNotesWithInvalidCategoryCustomization()))
        {
        }
    }
}
