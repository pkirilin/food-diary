using System;
using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import.UnitTests.Customizations
{
    class ExistingPagesDictionaryCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var page1 = fixture.Build<Page>()
                .With(p => p.Id, 1)
                .With(p => p.Date, DateTime.Parse("2020-05-03"))
                .Create();
            var page2 = fixture.Build<Page>()
                .With(p => p.Id, 2)
                .With(p => p.Date, DateTime.Parse("2020-05-04"))
                .Create();
            var page3 = fixture.Build<Page>()
                .With(p => p.Id, 3)
                .With(p => p.Date, DateTime.Parse("2020-05-05"))
                .Create();

            var pages = new List<Page>() { page1, page2, page3 };

            fixture.Register(() => pages.ToDictionary(p => p.Date));
        }
    }

    class ExistingProductsDictionaryCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var product1 = fixture.Build<Product>()
                .With(p => p.Id, 1)
                .With(p => p.Name, "Product 1")
                .Create();
            var product2 = fixture.Build<Product>()
                .With(p => p.Id, 2)
                .With(p => p.Name, "Product 2")
                .Create();
            var product3 = fixture.Build<Product>()
                .With(p => p.Id, 3)
                .With(p => p.Name, "Product 3")
                .Create();

            var products = new List<Product>() { product1, product2, product3 };

            fixture.Register(() => products.ToDictionary(p => p.Name));
        }
    }

    class ExistingCategoriesDictionaryCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var category1 = fixture.Build<Category>()
                .With(c => c.Id, 1)
                .With(c => c.Name, "Category 1")
                .Create();
            var category2 = fixture.Build<Category>()
                .With(c => c.Id, 2)
                .With(c => c.Name, "Category 2")
                .Create();
            var category3 = fixture.Build<Category>()
                .With(c => c.Id, 3)
                .With(c => c.Name, "Category 3")
                .Create();

            var categories = new List<Category>() { category1, category2, category3 };

            fixture.Register(() => categories.ToDictionary(c => c.Name));
        }
    }
}
