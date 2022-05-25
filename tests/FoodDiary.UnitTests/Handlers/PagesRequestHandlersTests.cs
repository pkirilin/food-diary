using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using FoodDiary.Application.Pages.Handlers;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.UnitTests.Attributes;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Handlers
{
    public class PagesRequestHandlersTests
    {
        private readonly Mock<IPageRepository> _pageRepositoryMock = new();

        public PagesRequestHandlersTests()
        {
            _pageRepositoryMock.SetupGet(r => r.UnitOfWork).Returns(new Mock<IUnitOfWork>().Object);
        }

        [Theory]
        [CustomAutoData]
        public async void CreatePageRequestHandler_CreatesPage(CreatePageRequest request, Page expectedPage)
        {
            var handler = new CreatePageRequestHandler(_pageRepositoryMock.Object);

            _pageRepositoryMock.Setup(r => r.Add(request.Entity)).Returns(expectedPage);

            // ReSharper disable once UnusedVariable
            var result = await handler.Handle(request, default);

            _pageRepositoryMock.Verify(r => r.Add(request.Entity), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeletePageRequestHandler_DeletesPage(DeletePageRequest request)
        {
            var handler = new DeletePageRequestHandler(_pageRepositoryMock.Object);

            await handler.Handle(request, default);

            _pageRepositoryMock.Verify(r => r.Remove(request.Entity), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeletePagesRequestHandler_DeletesPages(DeletePagesRequest request)
        {
            var handler = new DeletePagesRequestHandler(_pageRepositoryMock.Object);

            await handler.Handle(request, default);

            _pageRepositoryMock.Verify(r => r.RemoveRange(request.Entities), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void EditPageRequestHandler_UpdatesPage(EditPageRequest request)
        {
            var handler = new EditPageRequestHandler(_pageRepositoryMock.Object);

            await handler.Handle(request, default);

            _pageRepositoryMock.Verify(r => r.Update(request.Entity), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void GetDateForNewPageRequestHandler_ReturnsRequestedDate(GetDateForNewPageRequest request, List<Page> pagesByDate)
        {
            var handler = new GetDateForNewPageRequestHandler(_pageRepositoryMock.Object);
            var pagesByDateQuery = pagesByDate.AsQueryable();
            var expectedResult = pagesByDate.First().Date.AddDays(1);

            _pageRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(pagesByDateQuery);
            _pageRepositoryMock.Setup(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(pagesByDate);

            var result = await handler.Handle(request, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);

            result.Should().Be(expectedResult);
        }

        [Theory]
        [CustomAutoData]
        public async void GetPagesByExactDateRequestHandler_ReturnsRequestedPages(GetPagesByExactDateRequest request, List<Page> expectedResult)
        {
            var handler = new GetPagesByExactDateRequestHandler(_pageRepositoryMock.Object);
            var pagesQuery = expectedResult.AsQueryable();

            _pageRepositoryMock.Setup(r => r.GetQueryWithoutTracking()).Returns(pagesQuery);
            _pageRepositoryMock.Setup(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(expectedResult);

            var result = await handler.Handle(request, default);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);

            result.Should().BeEquivalentTo(expectedResult);
        }

        [Theory]
        [CustomAutoData]
        public async void GetPageByIdRequestHandler_ReturnsRequestedPage(GetPageByIdRequest request, Page expectedResult)
        {
            var handler = new GetPageByIdRequestHandler(_pageRepositoryMock.Object);

            _pageRepositoryMock.Setup(r => r.GetByIdAsync(request.Id, default))
                .ReturnsAsync(expectedResult);

            // ReSharper disable once UnusedVariable
            var result = await handler.Handle(request, default);

            _pageRepositoryMock.Verify(r => r.GetByIdAsync(request.Id, default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void GetPagesByIdsRequestHandler_ReturnsRequestedPages(GetPagesByIdsRequest request, List<Page> expectedResult)
        {
            var handler = new GetPagesByIdsRequestHandler(_pageRepositoryMock.Object);
            var pagesQuery = expectedResult.AsQueryable();

            _pageRepositoryMock.Setup(r => r.GetQuery()).Returns(pagesQuery);
            _pageRepositoryMock.Setup(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Page>>(), default))
                .ReturnsAsync(expectedResult);

            // ReSharper disable once UnusedVariable
            var result = await handler.Handle(request, default);

            _pageRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Page>>(), default), Times.Once);
        }
    }
}
