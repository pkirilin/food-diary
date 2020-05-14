using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.UnitTests.Customizations;
using Moq;
using Xunit;
using FoodDiary.Domain.Enums;
using AutoFixture.Xunit2;
using FoodDiary.Domain.Dtos;
using System;
using FoodDiary.Domain.Abstractions;
using FoodDiary.API.Services;
using FoodDiary.API.Services.Implementation;

namespace FoodDiary.UnitTests.Services
{
    public class PageServiceTests
    {
        private readonly Mock<IPageRepository> _pageRepositoryMock;

        private readonly IFixture _fixture;

        public PageServiceTests()
        {
            _pageRepositoryMock = new Mock<IPageRepository>();
            _fixture = SetupFixture();

            _pageRepositoryMock.SetupGet(r => r.UnitOfWork)
                .Returns(new Mock<IUnitOfWork>().Object);
        }

        public IPageService PageService => new PageService(_pageRepositoryMock.Object);

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        [Theory]
        [InlineAutoData]
        [InlineAutoData(null)]
        public async void SearchPages_ReturnsRequestedPagesCount_DependingOnShowCount(int? showCount)
        {
            var pageFilter = _fixture.Build<PageFilterDto>()
                .With(p => p.ShowCount, showCount)
                .Create();
            var expectedPagesCount = pageFilter.ShowCount ?? 10;
            var pages = _fixture.CreateMany<Page>(expectedPagesCount).ToList();
            var pagesQuery = pages.AsQueryable();

            _pageRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(pagesQuery);
            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(pages);

            var result = await PageService.SearchPagesAsync(pageFilter, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProducts(It.IsNotNull<IQueryable<Page>>()), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);
            result.Should().HaveCount(expectedPagesCount).And.Contain(pages);
        }

        [Theory]
        [InlineData(SortOrder.Ascending)]
        [InlineData(SortOrder.Descending)]
        public async void SearchPages_ReturnsOrderedPages_DependingOnSortOrder(SortOrder sortOrder)
        {
            var pageFilter = _fixture.Build<PageFilterDto>()
                .With(p => p.SortOrder, sortOrder)
                .Create();
            var pages = _fixture.CreateMany<Page>().ToList();
            var pagesQuery = pages.AsQueryable();
            var expectedOrderedPages = sortOrder == SortOrder.Ascending ?
                pages.OrderBy(p => p.Date).ToList()
                : pages.OrderByDescending(p => p.Date).ToList();

            _pageRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(pagesQuery);
            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(expectedOrderedPages);

            var result = await PageService.SearchPagesAsync(pageFilter, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProducts(It.IsNotNull<IQueryable<Page>>()), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);

            result.Should().Contain(expectedOrderedPages);
            if (sortOrder == SortOrder.Ascending)
                result.Should().BeInAscendingOrder(p => p.Date);
            else
                result.Should().BeInDescendingOrder(p => p.Date);
        }

        [Fact]
        public async void GetPageById_ReturnsPageWithRequestedId()
        {
            var expectedPage = _fixture.Create<Page>();
            _pageRepositoryMock.Setup(r => r.GetByIdAsync(It.IsAny<int>(), default))
                .ReturnsAsync(expectedPage);

            var result = await PageService.GetPageByIdAsync(expectedPage.Id, default);

            _pageRepositoryMock.Verify(r => r.GetByIdAsync(It.IsAny<int>(), default), Times.Once);
            result.Should().Be(expectedPage);
        }

        [Fact]
        public async void GetPagesByIds_ReturnsPagesWithRequestedIds()
        {
            var pages = _fixture.CreateMany<Page>().ToList();
            var pagesQuery = pages.AsQueryable();
            var pageIds = pages.Select(p => p.Id).ToList();

            _pageRepositoryMock.Setup(r => r.GetQuery())
                .Returns(pagesQuery);
            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(pagesQuery, default))
                .ReturnsAsync(pages);

            var result = await PageService.GetPagesByIdsAsync(pageIds, default);

            _pageRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(pagesQuery, default), Times.Once);
            result.Should().Contain(pages);
        }

        [Fact]
        public async void CreatePage_CreatesPageWithoutErrors()
        {
            var pageForCreate = _fixture.Create<Page>();
            _pageRepositoryMock.Setup(r => r.Add(pageForCreate))
                .Returns(pageForCreate);

            var result = await PageService.CreatePageAsync(pageForCreate, default);

            _pageRepositoryMock.Verify(r => r.Add(pageForCreate), Times.Once);
            result.Should().Be(pageForCreate);
        }

        [Fact]
        public async void EditPage_UpdatesPageWithoutErrors()
        {
            var pageForEdit = _fixture.Create<Page>();

            await PageService.EditPageAsync(pageForEdit, default);

            _pageRepositoryMock.Verify(r => r.Update(pageForEdit), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public async void DeletePage_DeletesPageWithoutErrors()
        {
            var pageForDelete = _fixture.Create<Page>();

            await PageService.DeletePageAsync(pageForDelete, default);

            _pageRepositoryMock.Verify(r => r.Delete(pageForDelete), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public async void BatchDeletePages_DeletesPagesWithoutErrors()
        {
            var pagesForBatchDelete = _fixture.CreateMany<Page>().ToList();

            await PageService.BatchDeletePagesAsync(pagesForBatchDelete, default);

            _pageRepositoryMock.Verify(r => r.DeleteRange(pagesForBatchDelete), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Fact]
        public async void ValidatePageAsync_ReturnsFalse_WhenPageHasDuplicateDate()
        {
            var createPageInfo = _fixture.Create<PageCreateEditDto>();
            var pagesWithTheSameDate = _fixture.CreateMany<Page>().ToList();

            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(pagesWithTheSameDate);

            var result = await PageService.ValidatePageAsync(createPageInfo, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);
            result.IsValid.Should().BeFalse();
        }

        [Theory]
        [InlineData("2019-12-11", "2019-12-12", true)]
        [InlineData("2019-12-11", "2019-12-11", true)]
        public void IsEditedPageValid_ReturnsTrue_WhenPageIsValidAfterItWasEdited(
            string oldPageDateStr,
            string newPageDateStr,
            bool isValid)
        {
            var originalPage = _fixture.Build<Page>()
                .With(p => p.Date, DateTime.Parse(oldPageDateStr))
                .Create();
            var editedPageData = _fixture.Build<PageCreateEditDto>()
                .With(p => p.Date, DateTime.Parse(newPageDateStr))
                .Create();
            var validationResult = _fixture.Build<ValidationResultDto>()
                .With(r => r.IsValid, isValid)
                .Create();

            var result = PageService.IsEditedPageValid(editedPageData, originalPage, validationResult);

            result.Should().BeTrue();
        }
    }
}
