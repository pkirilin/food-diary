using AutoFixture;
using FoodDiary.Domain.Dtos;

namespace FoodDiary.Import.UnitTests.Customizations
{
    class JsonProductWithExistingNameCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                var page = fixture.Build<ProductJsonItemDto>()
                    .With(p => p.Name, "Product 1")
                    .Create();

                return page;
            });
        }
    }

    class JsonProductWithNotExistingNameCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                var page = fixture.Build<ProductJsonItemDto>()
                    .With(p => p.Name, "Not existing product")
                    .Create();

                return page;
            });
        }
    }
}
