using System;
using System.Collections.Generic;
using AutoFixture;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.UnitTests.Services.TestData
{
    class PageServiceTestData
    {
        public static IEnumerable<object[]> SearchPages
        {
            get
            {
                var fixture = Fixtures.Custom;

                var page1 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-19"))
                    .Create();
                var page2 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-18"))
                    .Create();
                var page3 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-20"))
                    .Create();
                var page4 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-17"))
                    .Create();

                var sourcePages = new List<Page>() { page1, page2, page3, page4 };

                var request1 = fixture.Build<PagesSearchRequest>()
                    .With(r => r.ShowCount, 3)
                    .With(r => r.SortOrder, SortOrder.Ascending)
                    .OmitAutoProperties()
                    .Create();
                var request2 = fixture.Build<PagesSearchRequest>()
                    .Without(r => r.ShowCount)
                    .With(r => r.SortOrder, SortOrder.Descending)
                    .OmitAutoProperties()
                    .Create();

                var resultPages1 = new List<Page>() { page4, page2, page1 };
                var resultPages2 = new List<Page>() { page3, page1, page2, page4 };

                yield return new object[]
                {
                    request1, sourcePages, resultPages1
                };

                yield return new object[]
                {
                    request2, sourcePages, resultPages2
                };
            }
        }
    
        public static IEnumerable<object[]> GetPagesByIds
        {
            get
            {
                var fixture = Fixtures.Custom;

                var page1 = fixture.Build<Page>()
                    .With(p => p.Id, 1)
                    .Create();
                var page2 = fixture.Build<Page>()
                    .With(p => p.Id, 2)
                    .Create();
                var page3 = fixture.Build<Page>()
                    .With(p => p.Id, 3)
                    .Create();

                var requestedIds = new List<int>() { 2, 3 };
                var sourcePages = new List<Page>() { page1, page2, page3 };
                var resultPages = new List<Page>() { page2, page3 };

                yield return new object[]
                {
                    requestedIds, sourcePages, resultPages
                };
            }
        }

        public static IEnumerable<object[]> IsPageExists
        {
            get
            {
                var fixture = Fixtures.Custom;

                var page1 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-19"))
                    .Create();
                var page2 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-20"))
                    .Create();
                var page3 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-21"))
                    .Create();

                var sourcePages = new List<Page>() { page1, page2, page3 };
                var foundPages = new List<Page>() { page2 };
                var emptyPages = new List<Page>();

                yield return new object[]
                {
                    DateTime.Parse("2020-05-20"), sourcePages, foundPages, true
                };

                yield return new object[]
                {
                    DateTime.Parse("2020-05-30"), sourcePages, emptyPages, false
                };
            }
        }
    }
}
