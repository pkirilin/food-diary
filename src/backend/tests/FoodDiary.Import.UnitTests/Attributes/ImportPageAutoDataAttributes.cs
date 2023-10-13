using AutoFixture.Xunit2;
using FoodDiary.Import.UnitTests.Customizations;

namespace FoodDiary.Import.UnitTests.Attributes
{
    class ImportNotExistingPageAutoDataAttribute : AutoDataAttribute
    {
        public ImportNotExistingPageAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new ExistingPagesDictionaryCustomization())
            .Customize(new JsonPageWithNotExistingDateCustomization()))
        {
        }
    }

    class ImportExistingPageAutoDataAttribute : AutoDataAttribute
    {
        public ImportExistingPageAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new ExistingPagesDictionaryCustomization())
            .Customize(new JsonPageWithExistingDateCustomization()))
        {
        }
    }

    class ImportNotExistingProductAutoDataAttribute : AutoDataAttribute
    {
        public ImportNotExistingProductAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new ExistingProductsDictionaryCustomization())
            .Customize(new JsonProductWithNotExistingNameCustomization()))
        {
        }
    }

    class ImportExistingProductAutoDataAttribute : AutoDataAttribute
    {
        public ImportExistingProductAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new ExistingProductsDictionaryCustomization())
            .Customize(new JsonProductWithExistingNameCustomization()))
        {
        }
    }

    class ImportNotExistingCategoryAutoDataAttribute : AutoDataAttribute
    {
        public ImportNotExistingCategoryAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new ExistingCategoriesDictionaryCustomization())
            .Customize(new JsonCategoryWithNotExistingNameCustomization()))
        {
        }
    }

    class ImportExistingCategoryAutoDataAttribute : AutoDataAttribute
    {
        public ImportExistingCategoryAutoDataAttribute() : base(() => Fixtures.Custom
            .Customize(new ExistingCategoriesDictionaryCustomization())
            .Customize(new JsonCategoryWithExistingNameCustomization()))
        {
        }
    }
}
