using System.Collections.Generic;
using AutoFixture;
using FoodDiary.Domain.Entities;

namespace FoodDiary.UnitTests.Utils.TestData
{
    class CaloriesCalculatorTestData
    {
        public static IEnumerable<object[]> CalculateForNotes
        {
            get
            {
                var fixture = Fixtures.Custom;

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

                var notes = new List<Note> { note1, note2, note3 };

                yield return new object[] { notes, 576 };
                yield return new object[] { new List<Note>(), 0 };
            }
        }
    }
}
