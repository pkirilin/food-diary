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
        [CustomAutoData]
        public async void SearchPages_ReturnsRequestedPages(
            PagesSearchRequest request, List<Page> pages)
        {
            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(pages);

            var result = await Sut.SearchPagesAsync(request, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProducts(It.IsNotNull<IQueryable<Page>>()), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);

            result.Should().ContainInOrder(pages);
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
        [CustomAutoData]
        public async void GetPagesByIds_ReturnsRequestedPages(
            IEnumerable<int> pageIds, List<Page> pages)
        {
            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(pages);

            var result = await Sut.GetPagesByIdsAsync(pageIds, default);

            _pageRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);
            
            result.Should().Contain(pages);
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
        [CustomAutoData]
        public async void IsPageExists_ReturnsTrue_WhenPageWithTheSameDateExists(
            DateTime pageDate, List<Page> pagesWithTheSameDate)
        {
            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(pagesWithTheSameDate);

            var result = await Sut.IsPageExistsAsync(pageDate, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);
            
            result.Should().BeTrue();
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
    }
}
