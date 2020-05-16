using Xunit;
using Microsoft.Extensions.DependencyInjection;
using FoodDiary.API.Controllers.v1;
using AutoMapper;
using FoodDiary.API;
using System.Reflection;
using Moq;
using AutoFixture;
using FoodDiary.Domain.Entities;
using System.Linq;
using FoodDiary.UnitTests.Customizations;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.Domain.Utils;
using FoodDiary.Infrastructure.Utils;
using FoodDiary.API.Services;
using FoodDiary.API.Requests;
using System;

namespace FoodDiary.UnitTests.Controllers
{
    public class PagesControllerTests
    {
        private readonly IMapper _mapper;

        private readonly Mock<IPageService> _pageServiceMock;

        private readonly IFixture _fixture;

        public PagesControllerTests()
        {
            var serviceCollection = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .AddTransient<ICaloriesCalculator, CaloriesCalculator>();

            var serviceProvider = serviceCollection.BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
            _pageServiceMock = new Mock<IPageService>();
            _fixture = SetupFixture();
        }

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        public PagesController PagesController => new PagesController(_mapper, _pageServiceMock.Object);

        [Fact]
        public async void GetPages_ReturnsFilteredPages_WhenModelStateIsValid()
        {
            var pageFilter = _fixture.Create<PagesSearchRequest>();
            var expectedPages = _fixture.CreateMany<Page>();
            _pageServiceMock.Setup(s => s.SearchPagesAsync(pageFilter, default))
                .ReturnsAsync(expectedPages);
            var controller = PagesController;

            var result = await controller.GetPages(pageFilter, default);

            _pageServiceMock.Verify(s => s.SearchPagesAsync(pageFilter, default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async void GetPages_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var pageFilter = _fixture.Create<PagesSearchRequest>();
            var controller = PagesController;
            controller.ModelState.AddModelError(_fixture.Create<string>(), _fixture.Create<string>());

            var result = await controller.GetPages(pageFilter, default);

            _pageServiceMock.Verify(s => s.SearchPagesAsync(pageFilter, default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void CreatePage_CreatesPageSuccessfully_WhenPageCanBeCreated()
        {
            var createPageInfo = _fixture.Create<PageCreateEditRequest>();
            var createdPage = _fixture.Create<Page>();

            _pageServiceMock.Setup(s => s.IsPageExistsAsync(createPageInfo.Date, default))
                .ReturnsAsync(false);
            _pageServiceMock.Setup(s => s.CreatePageAsync(It.IsNotNull<Page>(), default))
                .ReturnsAsync(createdPage);

            var controller = PagesController;

            var result = await controller.CreatePage(createPageInfo, default);

            _pageServiceMock.Verify(s => s.IsPageExistsAsync(createPageInfo.Date, default), Times.Once);
            _pageServiceMock.Verify(s => s.CreatePageAsync(It.IsNotNull<Page>(), default), Times.Once);

            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async void CreatePage_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var createPageInfo = _fixture.Create<PageCreateEditRequest>();
            var controller = PagesController;
            controller.ModelState.AddModelError("some", "error");

            var result = await controller.CreatePage(createPageInfo, default);

            _pageServiceMock.Verify(s => s.IsPageExistsAsync(It.IsAny<DateTime>(), default), Times.Never);
            _pageServiceMock.Verify(s => s.CreatePageAsync(It.IsNotNull<Page>(), default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void CreatePage_ReturnsBadRequest_WhenPageCannotBeCreated()
        {
            var createPageInfo = _fixture.Create<PageCreateEditRequest>();

            _pageServiceMock.Setup(s => s.IsPageExistsAsync(createPageInfo.Date, default))
                .ReturnsAsync(true);

            var controller = PagesController;

            var result = await controller.CreatePage(createPageInfo, default);

            _pageServiceMock.Verify(s => s.IsPageExistsAsync(createPageInfo.Date, default), Times.Once);
            _pageServiceMock.Verify(s => s.CreatePageAsync(It.IsNotNull<Page>(), default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void EditPage_EditsPageSuccessfully_WhenPageCanBeUpdated()
        {
            var pageId = _fixture.Create<int>();
            var updatedPageInfo = _fixture.Create<PageCreateEditRequest>();
            var originalPage = _fixture.Create<Page>();

            _pageServiceMock.Setup(s => s.GetPageByIdAsync(pageId, default))
                .ReturnsAsync(originalPage);
            _pageServiceMock.Setup(s => s.IsPageExistsAsync(updatedPageInfo.Date, default))
                .ReturnsAsync(false);
            _pageServiceMock.Setup(s => s.IsEditedPageValid(updatedPageInfo, originalPage, false))
                .Returns(true);

            var controller = PagesController;

            var result = await controller.EditPage(pageId, updatedPageInfo, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageId, default), Times.Once);
            _pageServiceMock.Verify(s => s.IsPageExistsAsync(updatedPageInfo.Date, default), Times.Once);
            _pageServiceMock.Verify(s => s.IsEditedPageValid(updatedPageInfo, originalPage, false), Times.Once);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Once);

            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void EditPage_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var pageId = _fixture.Create<int>();
            var updatedPageInfo = _fixture.Create<PageCreateEditRequest>();
            var originalPage = _fixture.Create<Page>();
            var controller = PagesController;
            controller.ModelState.AddModelError("some", "error");

            var result = await controller.EditPage(pageId, updatedPageInfo, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageId, default), Times.Never);
            _pageServiceMock.Verify(s => s.IsPageExistsAsync(It.IsAny<DateTime>(), default), Times.Never);
            _pageServiceMock.Verify(s => s.IsEditedPageValid(updatedPageInfo, originalPage, It.IsAny<bool>()), Times.Never);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void EditPage_ReturnsBadRequest_WhenPageCannotBeEdited()
        {
            var pageId = _fixture.Create<int>();
            var updatedPageInfo = _fixture.Create<PageCreateEditRequest>();
            var originalPage = _fixture.Create<Page>();

            _pageServiceMock.Setup(s => s.GetPageByIdAsync(pageId, default))
                .ReturnsAsync(originalPage);
            _pageServiceMock.Setup(s => s.IsPageExistsAsync(updatedPageInfo.Date, default))
                .ReturnsAsync(true);
            _pageServiceMock.Setup(s => s.IsEditedPageValid(updatedPageInfo, originalPage, true))
                .Returns(false);
            var controller = PagesController;

            var result = await controller.EditPage(pageId, updatedPageInfo, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageId, default), Times.Once);
            _pageServiceMock.Verify(s => s.IsPageExistsAsync(updatedPageInfo.Date, default), Times.Once);
            _pageServiceMock.Verify(s => s.IsEditedPageValid(updatedPageInfo, originalPage, true), Times.Once);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void EditPage_ReturnsNotFound_WhenRequestedPageNotFound()
        {
            var pageId = _fixture.Create<int>();
            var updatedPageInfo = _fixture.Create<PageCreateEditRequest>();
            var originalPage = _fixture.Create<Page>();
            _pageServiceMock.Setup(s => s.GetPageByIdAsync(pageId, default))
                .ReturnsAsync(null as Page);
            var controller = PagesController;

            var result = await controller.EditPage(pageId, updatedPageInfo, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageId, default), Times.Once);
            _pageServiceMock.Verify(s => s.IsPageExistsAsync(It.IsAny<DateTime>(), default), Times.Never);
            _pageServiceMock.Verify(s => s.IsEditedPageValid(updatedPageInfo, originalPage, It.IsAny<bool>()), Times.Never);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async void DeletePage_DeletesPageSuccessfully_WhenRequestedPageExists()
        {
            var pageForDelete = _fixture.Create<Page>();

            _pageServiceMock.Setup(s => s.GetPageByIdAsync(pageForDelete.Id, default))
                .ReturnsAsync(pageForDelete);

            var controller = PagesController;

            var result = await controller.DeletePage(pageForDelete.Id, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageForDelete.Id, default), Times.Once);
            _pageServiceMock.Verify(s => s.DeletePageAsync(pageForDelete, default), Times.Once);

            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void DeletePage_ReturnsNotFound_WhenRequestedPageDoesNotExists()
        {
            var pageForDelete = _fixture.Create<Page>();

            _pageServiceMock.Setup(s => s.GetPageByIdAsync(pageForDelete.Id, default))
                .ReturnsAsync(null as Page);

            var controller = PagesController;

            var result = await controller.DeletePage(pageForDelete.Id, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageForDelete.Id, default), Times.Once);
            _pageServiceMock.Verify(s => s.DeletePageAsync(pageForDelete, default), Times.Never);

            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async void DeletePages_DeletesAllRequestedPagesSuccessfully_WhenAllRequestedPagesFoundInDatabase()
        {
            var pagesForDelete = _fixture.CreateMany<Page>().ToList();
            var pagesForDeleteIds = pagesForDelete.Select(p => p.Id).ToList();

            _pageServiceMock.Setup(s => s.GetPagesByIdsAsync(pagesForDeleteIds, default))
                .ReturnsAsync(pagesForDelete);

            var controller = PagesController;

            var result = await controller.DeletePages(pagesForDeleteIds, default);

            _pageServiceMock.Verify(s => s.GetPagesByIdsAsync(pagesForDeleteIds, default), Times.Once);
            _pageServiceMock.Verify(s => s.BatchDeletePagesAsync(pagesForDelete, default), Times.Once);

            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void DeletePages_ReturnsBadRequest_WhenAtLeastOneRequestedPageNotFoundInDatabase()
        {
            var pagesForDelete = _fixture.CreateMany<Page>(3).ToList();
            var pagesForDeleteIds = _fixture.CreateMany<int>(2).ToList();

            _pageServiceMock.Setup(s => s.GetPagesByIdsAsync(pagesForDeleteIds, default))
                .ReturnsAsync(pagesForDelete);

            var controller = PagesController;

            var result = await controller.DeletePages(pagesForDeleteIds, default);

            _pageServiceMock.Verify(s => s.GetPagesByIdsAsync(pagesForDeleteIds, default), Times.Once);
            _pageServiceMock.Verify(s => s.BatchDeletePagesAsync(pagesForDelete, default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
