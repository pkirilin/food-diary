using System;
using System.Collections.Generic;
using AutoFixture;
using FoodDiary.Domain.Entities;

namespace FoodDiary.UnitTests.Services.TestData
{
    class ExportServiceTestData
    {
        public static IEnumerable<object[]> GetPagesForExport
        {
            get
            {
                var fixture = Fixtures.Custom;

                var page1 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-20"))
                    .Create();
                var page2 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-19"))
                    .Create();
                var page3 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-18"))
                    .Create();
                var page4 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-17"))
                    .Create();

                var startDate = DateTime.Parse("2020-05-18");
                var endDate = DateTime.Parse("2020-05-19");
                var sourcePages = new List<Page>() { page1, page2, page3, page4 };
                var pagesForExportUnordered = new List<Page>() { page2, page3 };
                var pagesForExport = new List<Page>() { page3, page2 };

                yield return new object[]
                {
                    startDate, endDate, sourcePages, pagesForExportUnordered, pagesForExport
                };
            }
        }
    }
}
