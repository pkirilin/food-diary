using System;
using System.Collections.Generic;
using AutoFixture;
using FoodDiary.Import.Models;

namespace FoodDiary.Import.UnitTests.Customizations
{
    class JsonObjectWithUniquePagesCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            var testPage1 = fixture.Build<PageJsonItem>()
                .With(p => p.Date, DateTime.Parse("2020-05-03"))
                .Create();
            var testPage2 = fixture.Build<PageJsonItem>()
                .With(p => p.Date, DateTime.Parse("2020-05-04"))
                .Create();
            var testPage3 = fixture.Build<PageJsonItem>()
                .With(p => p.Date, DateTime.Parse("2020-05-05"))
                .Create();

            fixture.Register(() =>
            {
                return new PagesJsonObject
                {
                    Pages = new List<PageJsonItem>() { testPage1, testPage2, testPage3 }
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
                return new PagesJsonObject
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
            var testPage1 = fixture.Build<PageJsonItem>()
                .With(p => p.Date, DateTime.Parse("2020-05-03"))
                .Create();
            var testPage2 = fixture.Build<PageJsonItem>()
                .With(p => p.Date, DateTime.Parse("2020-05-04"))
                .Create();
            var testPage3 = fixture.Build<PageJsonItem>()
                .With(p => p.Date, DateTime.Parse("2020-05-05"))
                .Create();
            var testPage4 = fixture.Build<PageJsonItem>()
                .With(p => p.Date, DateTime.Parse("2020-05-04"))
                .Create();

            fixture.Register(() =>
            {
                return new PagesJsonObject
                {
                    Pages = new List<PageJsonItem>() { testPage1, testPage2, testPage3, testPage4 }
                };
            });
        }
    }
}
