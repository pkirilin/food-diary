using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;
using System;
using FoodDiary.Domain.Abstractions;
using FoodDiary.API.Services;
using FoodDiary.API.Services.Implementation;
using FoodDiary.API.Requests;
using FoodDiary.UnitTests.Attributes;
using System.Collections.Generic;
using FoodDiary.UnitTests.Services.TestData;

namespace FoodDiary.UnitTests.Services
{
    public class PageServiceTests
    {
        private readonly Mock<IPageRepository> _pageRepositoryMock;

        private readonly IFixture _fixture = Fixtures.Custom;

        public PageServiceTests()
        {
            _pageRepositoryMock = new Mock<IPageRepository>();

            _pageRepositoryMock.SetupGet(r => r.UnitOfWork)
                .Returns(new Mock<IUnitOfWork>().Object);
        }

        public IPageService Sut => new PageService(_pageRepositoryMock.Object);

        [Theory]
        [MemberData(nameof(PageServiceTestData.SearchPages), MemberType = typeof(PageServiceTestData))]
        public async void SearchPages_ReturnsRequestedPages(
            PagesSearchRequest request,
            List<Page> sourcePages,
            List<Page> resultPages)
        {
            var resultPagesQuery = resultPages.AsQueryable();

            _pageRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourcePages.AsQueryable());

            _pageRepositoryMock.Setup(r => r.LoadNotesWithProducts(resultPagesQuery))
                .Returns(resultPagesQuery);

            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(resultPagesQuery, default))
                .ReturnsAsync(resultPages);

            var result = await Sut.SearchPagesAsync(request, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProducts(resultPagesQuery), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(resultPagesQuery, default), Times.Once);

            result.Should().ContainInOrder(resultPages);
        }

        [Theory]
        [CustomAutoData]
        public async void GetPageById_ReturnsRequestedPage(int requestedPageId, Page requestedPage)
        {
            _pageRepositoryMock.Setup(r => r.GetByIdAsync(requestedPageId, default))
                .ReturnsAsync(requestedPage);

            var result = await Sut.GetPageByIdAsync(requestedPageId, default);

            _pageRepositoryMock.Verify(r => r.GetByIdAsync(requestedPageId, default), Times.Once);
            
            result.Should().Be(requestedPage);
        }

        [Theory]
        [MemberData(nameof(PageServiceTestData.GetPagesByIds), MemberType = typeof(PageServiceTestData))]
        public async void GetPagesByIds_ReturnsRequestedPages(
            IEnumerable<int> requestedIds,
            List<Page> sourcePages,
            List<Page> resultPages)
        {
            var resultPagesQuery = resultPages.AsQueryable();

            _pageRepositoryMock.Setup(r => r.GetQuery())
                .Returns(sourcePages.AsQueryable());

            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(resultPagesQuery, default))
                .ReturnsAsync(resultPages);

            var result = await Sut.GetPagesByIdsAsync(requestedIds, default);

            _pageRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(resultPagesQuery, default), Times.Once);
            
            result.Should().Contain(resultPages);
        }

        [Theory]
        [CustomAutoData]
        public async void CreatePage_CreatesPage(Page pageForCreate)
        {
            _pageRepositoryMock.Setup(r => r.Add(pageForCreate))
                .Returns(pageForCreate);

            var result = await Sut.CreatePageAsync(pageForCreate, default);

            _pageRepositoryMock.Verify(r => r.Add(pageForCreate), Times.Once);

            result.Should().Be(pageForCreate);
        }

        [Theory]
        [CustomAutoData]
        public async void EditPage_UpdatesPage(Page pageForUpdate)
        {
            await Sut.EditPageAsync(pageForUpdate, default);

            _pageRepositoryMock.Verify(r => r.Update(pageForUpdate), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeletePage_DeletesPage(Page pageForDelete)
        {
            await Sut.DeletePageAsync(pageForDelete, default);

            _pageRepositoryMock.Verify(r => r.Delete(pageForDelete), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void BatchDeletePages_DeletesPages(IEnumerable<Page> pagesForDelete)
        {
            await Sut.BatchDeletePagesAsync(pagesForDelete, default);

            _pageRepositoryMock.Verify(r => r.DeleteRange(pagesForDelete), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [MemberData(nameof(PageServiceTestData.IsPageExists), MemberType = typeof(PageServiceTestData))]
        public async void IsPageExists_ReturnsTrue_WhenPageWithTheSameDateExists(
            DateTime pageDate,
            List<Page> sourcePages,
            List<Page> pagesWithTheSameDate,
            bool expectedResult)
        {
            var pagesWithTheSameDateQuery = pagesWithTheSameDate.AsQueryable();

            _pageRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourcePages.AsQueryable());

            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(pagesWithTheSameDateQuery, default))
                .ReturnsAsync(pagesWithTheSameDate);

            var result = await Sut.IsPageExistsAsync(pageDate, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(pagesWithTheSameDateQuery, default), Times.Once);
            
            result.Should().Be(expectedResult);
        }

        [Theory]
        [InlineData("2019-12-11", "2019-12-12", false)]
        [InlineData("2019-12-11", "2019-12-11", true)]
        public void IsEditedPageValid_ReturnsTrue_WhenPageIsValidAfterItWasEdited(
            string oldPageDateStr,
            string newPageDateStr,
            bool isPageExists)
        {
            var originalPage = _fixture.Build<Page>()
                .With(p => p.Date, DateTime.Parse(oldPageDateStr))
                .Create();
            var editedPageData = _fixture.Build<PageCreateEditRequest>()
                .With(p => p.Date, DateTime.Parse(newPageDateStr))
                .Create();

            var result = Sut.IsEditedPageValid(editedPageData, originalPage, isPageExists);

            result.Should().BeTrue();
        }

        [Theory]
        [MemberData(nameof(PageServiceTestData.GetDateForNewPage), MemberType = typeof(PageServiceTestData))]
        public async void GetDateForNewPage_ReturnsCorrectDate(
            List<Page> sourcePages,
            List<Page> lastPagesByDate,
            DateTime dateForNewPage)
        {
            var lastPagesByDateQuery = lastPagesByDate.AsQueryable();

            _pageRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourcePages.AsQueryable());

            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(lastPagesByDateQuery, default))
                .ReturnsAsync(lastPagesByDate);

            var result = await Sut.GetDateForNewPageAsync(default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(lastPagesByDateQuery, default), Times.Once);

            result.Should().Be(dateForNewPage);
        }

        [Theory]
        [MemberData(nameof(PageServiceTestData.AreDateRangesValid), MemberType = typeof(PageServiceTestData))]
        public void AreDateRangesValid_ValidatesDateRanges(
            DateTime? startDate,
            DateTime? endDate,
            bool expectedResult)
        {
            var result = Sut.AreDateRangesValid(startDate, endDate);

            result.Should().Be(expectedResult);
        }
    }
}
