using System.Collections.Generic;
using AutoFixture;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Enums;

namespace FoodDiary.Import.UnitTests.Customizations
{
    class JsonPagesWithValidNotesCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                var note1 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.DisplayOrder, 0)
                    .With(n => n.ProductQuantity, 100)
                    .Create();
                var note2 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.DisplayOrder, 1)
                    .With(n => n.ProductQuantity, 120)
                    .Create();
                var note3 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Lunch)
                    .With(n => n.DisplayOrder, 0)
                    .With(n => n.ProductQuantity, 250)
                    .Create();
                var note4 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Lunch)
                    .With(n => n.DisplayOrder, 1)
                    .With(n => n.ProductQuantity, 310)
                    .Create();

                var pages = fixture.Build<PageJsonItemDto>()
                    .With(p => p.Notes, new List<NoteJsonItemDto>()
                    {
                        note1, note2, note3, note4
                    })
                    .CreateMany();

                return pages;
            });
        }
    }

    class JsonPagesWithDuplicateDisplayOrdersCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                var note1 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.DisplayOrder, 0)
                    .With(n => n.ProductQuantity, 100)
                    .Create();
                var note2 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.DisplayOrder, 0)
                    .With(n => n.ProductQuantity, 120)
                    .Create();

                var pages = fixture.Build<PageJsonItemDto>()
                    .With(p => p.Notes, new List<NoteJsonItemDto>()
                    {
                        note1, note2
                    })
                    .CreateMany();

                return pages;
            });
        }
    }

    class JsonPagesWithInvalidDisplayOrdersCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                var note1 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.DisplayOrder, -1)
                    .With(n => n.ProductQuantity, 100)
                    .Create();
                var note2 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.DisplayOrder, 1000)
                    .With(n => n.ProductQuantity, 120)
                    .Create();

                var pages = fixture.Build<PageJsonItemDto>()
                    .With(p => p.Notes, new List<NoteJsonItemDto>()
                    {
                        note1, note2
                    })
                    .CreateMany();

                return pages;
            });
        }
    }

    class JsonPagesWithInvalidMealTypesCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                var note1 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, (MealType)(-1))
                    .With(n => n.DisplayOrder, 0)
                    .With(n => n.ProductQuantity, 100)
                    .Create();
                var note2 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.DisplayOrder, 1)
                    .With(n => n.ProductQuantity, 120)
                    .Create();
                var note3 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Lunch)
                    .With(n => n.DisplayOrder, 0)
                    .With(n => n.ProductQuantity, 200)
                    .Create();
                var note4 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, (MealType)10000)
                    .With(n => n.DisplayOrder, 1)
                    .With(n => n.ProductQuantity, 450)
                    .Create();

                var pages = fixture.Build<PageJsonItemDto>()
                    .With(p => p.Notes, new List<NoteJsonItemDto>()
                    {
                        note1, note2, note3, note4
                    })
                    .CreateMany();

                return pages;
            });
        }
    }

    class JsonPagesWithInvalidProductQuantitiesCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                var note1 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.DisplayOrder, 0)
                    .With(n => n.ProductQuantity, 9)
                    .Create();
                var note2 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.DisplayOrder, 1)
                    .With(n => n.ProductQuantity, 1001)
                    .Create();
                var note3 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Lunch)
                    .With(n => n.DisplayOrder, 0)
                    .With(n => n.ProductQuantity, 10)
                    .Create();
                var note4 = fixture.Build<NoteJsonItemDto>()
                    .With(n => n.MealType, MealType.Lunch)
                    .With(n => n.DisplayOrder, 1)
                    .With(n => n.ProductQuantity, 1000)
                    .Create();

                var pages = fixture.Build<PageJsonItemDto>()
                    .With(p => p.Notes, new List<NoteJsonItemDto>()
                    {
                        note1, note2, note3, note4
                    })
                    .CreateMany();

                return pages;
            });
        }
    }
}
