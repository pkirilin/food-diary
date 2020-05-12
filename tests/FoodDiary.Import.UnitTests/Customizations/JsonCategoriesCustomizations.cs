using AutoFixture;

namespace FoodDiary.Import.UnitTests.Customizations
{
    class JsonCategoryWithExistingNameCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                return "Category 1";
            });
        }
    }

    class JsonCategoryWithNotExistingNameCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                return "Not existing category";
            });
        }
    }
}
