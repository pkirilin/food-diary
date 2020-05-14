using System.Collections.Generic;
using AutoFixture;
using FoodDiary.Domain.Entities;

namespace FoodDiary.UnitTests.Customizations
{
    class NotesWithTotalCaloriesCountCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Customize(new FixtureWithCircularReferencesCustomization());

            var product1 = fixture.Build<Product>()
                    .With(p => p.CaloriesCost, 60)
                    .Create();
            var product2 = fixture.Build<Product>()
                .With(p => p.CaloriesCost, 120)
                .Create();
            var product3 = fixture.Build<Product>()
                .With(p => p.CaloriesCost, 240)
                .Create();

            var note1 = fixture.Build<Note>()
                .With(n => n.ProductQuantity, 300)
                .With(n => n.Product, product1)
                .Create();
            var note2 = fixture.Build<Note>()
                .With(n => n.ProductQuantity, 170)
                .With(n => n.Product, product2)
                .Create();
            var note3 = fixture.Build<Note>()
                .With(n => n.ProductQuantity, 80)
                .With(n => n.Product, product3)
                .Create();

            fixture.Register(() => new List<Note>() { note1, note2, note3 });
            fixture.Register(() => 576);
        }
    }

    class EmptyNotesWithZeroTotalCaloriesCountCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() => new List<Note>());
            fixture.Register(() => 0);
        }
    }
}
