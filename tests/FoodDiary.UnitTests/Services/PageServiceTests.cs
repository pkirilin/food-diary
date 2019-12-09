using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;
using FoodDiary.Infrastructure.Services;
using FoodDiary.UnitTests.Customizations;
using Moq;
using Xunit;
using FoodDiary.Domain.Enums;
using AutoFixture.Xunit2;
using FoodDiary.Domain.Dtos;

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
            _pageRepositoryMock.Setup(r => r.GetListFromQuery(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(pages);

            var result = await PageService.SearchPagesAsync(pageFilter, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQuery(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);
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
            _pageRepositoryMock.Setup(r => r.GetListFromQuery(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(expectedOrderedPages);

            var result = await PageService.SearchPagesAsync(pageFilter, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQuery(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);

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
            _pageRepositoryMock.Setup(r => r.GetListFromQuery(pagesQuery, default))
                .ReturnsAsync(pages);

            var result = await PageService.GetPagesByIdsAsync(pageIds, default);

            _pageRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQuery(pagesQuery, default), Times.Once);
            result.Should().Contain(pages);
        }

        [Fact]
        public async void CreatePage_CreatesPageWithoutErrors()
        {
            var pageForCreate = _fixture.Create<Page>();
            _pageRepositoryMock.Setup(r => r.CreateAsync(pageForCreate, default))
                .ReturnsAsync(pageForCreate);

            var result = await PageService.CreatePageAsync(pageForCreate, default);

            _pageRepositoryMock.Verify(r => r.CreateAsync(pageForCreate, default), Times.Once);
            result.Should().Be(pageForCreate);
        }

        [Fact]
        public async void EditPage_UpdatesPageWithoutErrors()
        {
            var pageForEdit = _fixture.Create<Page>();
            _pageRepositoryMock.Setup(r => r.UpdateAsync(pageForEdit, default))
                .ReturnsAsync(pageForEdit);

            var result = await PageService.EditPageAsync(pageForEdit, default);

            _pageRepositoryMock.Verify(r => r.UpdateAsync(pageForEdit, default), Times.Once);
            result.Should().Be(pageForEdit);
        }

        [Fact]
        public async void DeletePage_DeletesPageWithoutErrors()
        {
            var pageForDelete = _fixture.Create<Page>();
            _pageRepositoryMock.Setup(r => r.DeleteAsync(pageForDelete, default))
                .ReturnsAsync(pageForDelete);

            var result = await PageService.DeletePageAsync(pageForDelete, default);

            _pageRepositoryMock.Verify(r => r.DeleteAsync(pageForDelete, default), Times.Once);
            result.Should().Be(pageForDelete);
        }

        [Fact]
        public async void BatchDeletePages_DeletesPagesWithoutErrors()
        {
            var pagesForBatchDelete = _fixture.CreateMany<Page>().ToList();
            _pageRepositoryMock.Setup(r => r.DeleteRangeAsync(pagesForBatchDelete, default))
                .ReturnsAsync(pagesForBatchDelete);

            var result = await PageService.BatchDeletePagesAsync(pagesForBatchDelete, default);

            _pageRepositoryMock.Verify(r => r.DeleteRangeAsync(pagesForBatchDelete, default), Times.Once);
            result.Should().Contain(pagesForBatchDelete);
        }

        [Fact]
        public async void PageCanBeCreated_ReturnsFalse_WhenPageHasDuplicateDate()
        {
            var createPageInfo = _fixture.Create<PageCreateEditDto>();

            _pageRepositoryMock.Setup(r => r.IsDuplicateAsync(createPageInfo.Date, default))
                .ReturnsAsync(true);

            var result = await PageService.PageCanBeCreatedAsync(createPageInfo, default);

            _pageRepositoryMock.Verify(r => r.IsDuplicateAsync(createPageInfo.Date, default), Times.Once);
            result.Should().BeFalse();
        }

        [Fact]
        public async void PageCanBeUpdated_ReturnsFalse_WhenPageHasChangedAndHasDuplicateDate()
        {
            var originalPage = _fixture.Create<Page>();
            var editPageInfo = _fixture.Build<PageCreateEditDto>()
                .With(p => p.Id, originalPage.Id)
                .With(p => p.Date, originalPage.Date.AddDays(1))
                .Create();

            _pageRepositoryMock.Setup(r => r.IsDuplicateAsync(editPageInfo.Date, default))
               .ReturnsAsync(true);

            var result = await PageService.PageCanBeUpdatedAsync(editPageInfo, originalPage, default);

            _pageRepositoryMock.Verify(r => r.IsDuplicateAsync(editPageInfo.Date, default), Times.Once);
            result.Should().BeFalse();
        }
    }
}
