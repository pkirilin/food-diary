using AutoFixture;
using FoodDiary.Domain.Dtos;

namespace FoodDiary.Import.UnitTests.Customizations
{
    class JsonProductWithExistingNameCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var product = fixture.Build<ProductJsonItemDto>()
                .With(p => p.Name, "Product 1")
                .Create();

            fixture.Register(() => product);
        }
    }

    class JsonProductWithNotExistingNameCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var product = fixture.Build<ProductJsonItemDto>()
                .With(p => p.Name, "Not existing product")
                .Create();

            fixture.Register(() => product);
        }
    }
}
