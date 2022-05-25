using System;
using System.Collections.Generic;
using AutoFixture;
using FoodDiary.Contracts.Export.Json;

namespace FoodDiary.Import.UnitTests.Customizations
{
    class JsonPagesWithValidNotesCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var note1 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 1)
                .With(n => n.DisplayOrder, 0)
                .With(n => n.ProductQuantity, 100)
                .Create();
            var note2 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 1)
                .With(n => n.DisplayOrder, 1)
                .With(n => n.ProductQuantity, 120)
                .Create();
            var note3 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 3)
                .With(n => n.DisplayOrder, 0)
                .With(n => n.ProductQuantity, 250)
                .Create();
            var note4 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 3)
                .With(n => n.DisplayOrder, 1)
                .With(n => n.ProductQuantity, 310)
                .Create();

            var pages = fixture.Build<JsonExportPageDto>()
                .With(p => p.Notes, new List<JsonExportNoteDto>()
                {
                        note1, note2, note3, note4
                })
                .CreateMany();

            fixture.Register(() => pages);
        }
    }

    class JsonPagesWithDuplicateDisplayOrdersCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var note1 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 1)
                .With(n => n.DisplayOrder, 0)
                .With(n => n.ProductQuantity, 100)
                .Create();
            var note2 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 1)
                .With(n => n.DisplayOrder, 0)
                .With(n => n.ProductQuantity, 120)
                .Create();

            var pages = fixture.Build<JsonExportPageDto>()
                .With(p => p.Notes, new List<JsonExportNoteDto>()
                {
                        note1, note2
                })
                .CreateMany();

            fixture.Register(() => pages);
        }
    }

    class JsonPagesWithInvalidDisplayOrdersCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var note1 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 1)
                .With(n => n.DisplayOrder, -1)
                .With(n => n.ProductQuantity, 100)
                .Create();
            var note2 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 1)
                .With(n => n.DisplayOrder, 1000)
                .With(n => n.ProductQuantity, 120)
                .Create();

            var pages = fixture.Build<JsonExportPageDto>()
                .With(p => p.Notes, new List<JsonExportNoteDto>()
                {
                        note1, note2
                })
                .CreateMany();

            fixture.Register(() => pages);
        }
    }

    class JsonPagesWithInvalidMealTypesCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var note1 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, -1)
                .With(n => n.DisplayOrder, 0)
                .With(n => n.ProductQuantity, 100)
                .Create();
            var note2 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 1)
                .With(n => n.DisplayOrder, 1)
                .With(n => n.ProductQuantity, 120)
                .Create();
            var note3 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 3)
                .With(n => n.DisplayOrder, 0)
                .With(n => n.ProductQuantity, 200)
                .Create();
            var note4 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 10000)
                .With(n => n.DisplayOrder, 1)
                .With(n => n.ProductQuantity, 450)
                .Create();

            var pages = fixture.Build<JsonExportPageDto>()
                .With(p => p.Notes, new List<JsonExportNoteDto>()
                {
                        note1, note2, note3, note4
                })
                .CreateMany();

            fixture.Register(() => pages);
        }
    }

    class JsonPagesWithInvalidProductQuantitiesCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var note1 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 1)
                .With(n => n.DisplayOrder, 0)
                .With(n => n.ProductQuantity, 9)
                .Create();
            var note2 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 1)
                .With(n => n.DisplayOrder, 1)
                .With(n => n.ProductQuantity, 1001)
                .Create();
            var note3 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 3)
                .With(n => n.DisplayOrder, 0)
                .With(n => n.ProductQuantity, 10)
                .Create();
            var note4 = fixture.Build<JsonExportNoteDto>()
                .With(n => n.MealType, 3)
                .With(n => n.DisplayOrder, 1)
                .With(n => n.ProductQuantity, 1000)
                .Create();

            var pages = fixture.Build<JsonExportPageDto>()
                .With(p => p.Notes, new List<JsonExportNoteDto>()
                {
                        note1, note2, note3, note4
                })
                .CreateMany();

            fixture.Register(() => pages);
        }
    }

    class JsonPageWithNotExistingDateCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var page = fixture.Build<JsonExportPageDto>()
                .With(p => p.Date, DateTime.Parse("2020-05-01"))
                .Create();

            fixture.Register(() => page);
        }
    }

    class JsonPageWithExistingDateCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var page = fixture.Build<JsonExportPageDto>()
                .With(p => p.Date, DateTime.Parse("2020-05-03"))
                .Create();

            fixture.Register(() => page);
        }
    }
}
