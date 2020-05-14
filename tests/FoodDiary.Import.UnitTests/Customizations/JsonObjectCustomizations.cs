using System;
using System.Collections.Generic;
using AutoFixture;
using FoodDiary.Domain.Dtos;

namespace FoodDiary.Import.UnitTests.Customizations
{
    class JsonObjectWithUniquePagesCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var testPage1 = fixture.Build<PageJsonItemDto>()
                .With(p => p.Date, DateTime.Parse("2020-05-03"))
                .Create();
            var testPage2 = fixture.Build<PageJsonItemDto>()
                .With(p => p.Date, DateTime.Parse("2020-05-04"))
                .Create();
            var testPage3 = fixture.Build<PageJsonItemDto>()
                .With(p => p.Date, DateTime.Parse("2020-05-05"))
                .Create();

            fixture.Register(() =>
            {
                return new PagesJsonObjectDto
                {
                    Pages = new List<PageJsonItemDto>() { testPage1, testPage2, testPage3 }
                };
            });
        }
    }

    class JsonObjectWithNullPagesCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register(() =>
            {
                return new PagesJsonObjectDto
                {
                    Pages = null
                };
            });
        }
    }

    class JsonObjectWithDuplicatePageDatesCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var testPage1 = fixture.Build<PageJsonItemDto>()
                .With(p => p.Date, DateTime.Parse("2020-05-03"))
                .Create();
            var testPage2 = fixture.Build<PageJsonItemDto>()
                .With(p => p.Date, DateTime.Parse("2020-05-04"))
                .Create();
            var testPage3 = fixture.Build<PageJsonItemDto>()
                .With(p => p.Date, DateTime.Parse("2020-05-05"))
                .Create();
            var testPage4 = fixture.Build<PageJsonItemDto>()
                .With(p => p.Date, DateTime.Parse("2020-05-04"))
                .Create();

            fixture.Register(() =>
            {
                return new PagesJsonObjectDto
                {
                    Pages = new List<PageJsonItemDto>() { testPage1, testPage2, testPage3, testPage4 }
                };
            });
        }
    }
}
