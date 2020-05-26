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
                var startDate = DateTime.Parse("2020-05-18");
                var endDate = DateTime.Parse("2020-05-19");

                var request1 = fixture.Build<PagesSearchRequest>()
                    .With(r => r.SortOrder, SortOrder.Ascending)
                    .OmitAutoProperties()
                    .Create();
                var request2 = fixture.Build<PagesSearchRequest>()
                    .With(r => r.SortOrder, SortOrder.Descending)
                    .OmitAutoProperties()
                    .Create();
                var request3 = fixture.Build<PagesSearchRequest>()
                    .With(r => r.SortOrder, SortOrder.Descending)
                    .With(r => r.StartDate, startDate)
                    .OmitAutoProperties()
                    .Create();
                var request4 = fixture.Build<PagesSearchRequest>()
                    .With(r => r.SortOrder, SortOrder.Descending)
                    .With(r => r.EndDate, endDate)
                    .OmitAutoProperties()
                    .Create();
                var request5 = fixture.Build<PagesSearchRequest>()
                    .With(r => r.SortOrder, SortOrder.Descending)
                    .With(r => r.StartDate, startDate)
                    .With(r => r.EndDate, endDate)
                    .OmitAutoProperties()
                    .Create();

                var resultPages1 = new List<Page>() { page4, page2, page1, page3 };
                var resultPages2 = new List<Page>() { page3, page1, page2, page4 };
                var resultPages3 = new List<Page>() { page3, page1, page2 };
                var resultPages4 = new List<Page>() { page1, page2, page4 };
                var resultPages5 = new List<Page>() { page1, page2 };

                yield return new object[] { request1, sourcePages, resultPages1 };
                yield return new object[] { request2, sourcePages, resultPages2 };
                yield return new object[] { request3, sourcePages, resultPages3 };
                yield return new object[] { request4, sourcePages, resultPages4 };
                yield return new object[] { request5, sourcePages, resultPages5 };
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

        public static IEnumerable<object[]> GetDateForNewPage
        {
            get
            {
                var fixture = Fixtures.Custom;

                var page1 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-19"))
                    .Create();
                var page2 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-21"))
                    .Create();
                var page3 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-20"))
                    .Create();

                var sourcePages = new List<Page>() { page1, page2, page3 };
                var lastPagesByDate = new List<Page>() { page2 };
                var dateForNewPage = DateTime.Parse("2020-05-22");
                var emptyPages = new List<Page>();

                yield return new object[] { sourcePages, lastPagesByDate, dateForNewPage };
                yield return new object[] { emptyPages, emptyPages, DateTime.Now.Date };
            }
        }

        public static IEnumerable<object[]> AreDateRangesValid
        {
            get
            {
                var noDate = null as DateTime?;
                var lesserDate = DateTime.Parse("2020-05-26");
                var greaterDate = DateTime.Parse("2020-05-30");

                yield return new object[] { noDate, noDate, true };
                yield return new object[] { noDate, greaterDate, true };
                yield return new object[] { lesserDate, noDate, true };
                yield return new object[] { lesserDate, greaterDate, true };
                yield return new object[] { greaterDate, lesserDate, false };
            }
        }
    }
}
