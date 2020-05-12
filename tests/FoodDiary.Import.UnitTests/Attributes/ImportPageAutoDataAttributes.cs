using AutoFixture;
using AutoFixture.Xunit2;
using FoodDiary.Import.UnitTests.Customizations;
using FoodDiary.UnitTests.Customizations;

namespace FoodDiary.Import.UnitTests.Attributes
{
    class ImportNotExistingPageAutoDataAttribute : AutoDataAttribute
    {
        public ImportNotExistingPageAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new ExistingPagesDictionaryCustomization())
            .Customize(new JsonPageWithNotExistingDateCustomization()))
        {
        }
    }

    class ImportExistingPageAutoDataAttribute : AutoDataAttribute
    {
        public ImportExistingPageAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new ExistingPagesDictionaryCustomization())
            .Customize(new JsonPageWithExistingDateCustomization()))
        {
        }
    }

    class ImportNotExistingProductAutoDataAttribute : AutoDataAttribute
    {
        public ImportNotExistingProductAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new ExistingProductsDictionaryCustomization())
            .Customize(new JsonProductWithNotExistingNameCustomization()))
        {
        }
    }

    class ImportExistingProductAutoDataAttribute : AutoDataAttribute
    {
        public ImportExistingProductAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new ExistingProductsDictionaryCustomization())
            .Customize(new JsonProductWithExistingNameCustomization()))
        {
        }
    }

    class ImportNotExistingCategoryAutoDataAttribute : AutoDataAttribute
    {
        public ImportNotExistingCategoryAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new ExistingCategoriesDictionaryCustomization())
            .Customize(new JsonCategoryWithNotExistingNameCustomization()))
        {
        }
    }

    class ImportExistingCategoryAutoDataAttribute : AutoDataAttribute
    {
        public ImportExistingCategoryAutoDataAttribute() : base(() => new Fixture()
            .Customize(new FixtureWithCircularReferencesCustomization())
            .Customize(new ExistingCategoriesDictionaryCustomization())
            .Customize(new JsonCategoryWithExistingNameCustomization()))
        {
        }
    }
}
