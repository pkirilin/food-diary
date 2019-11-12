using FoodDiary.Domain.Dtos;
using Xunit;
using AutoFixture.Xunit2;
using FoodDiary.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using FoodDiary.API.Controllers.v1;
using AutoMapper;
using FoodDiary.API;
using System.Reflection;
using FoodDiary.Domain.Services;
using Moq;
using AutoFixture;
using FoodDiary.Domain.Entities;
using System.Linq;
using FoodDiary.UnitTests.Customizations;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.UnitTests.Controllers
{
    public class PagesControllerTests
    {
        private readonly ILoggerFactory _loggerFactory;

        private readonly IMapper _mapper;

        private readonly Mock<IPageService> _pageServiceMock;

        private readonly IFixture _fixture;

        public PagesControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddLogging()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .BuildServiceProvider();

            _loggerFactory = serviceProvider.GetService<ILoggerFactory>();
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

        public PagesController PagesController => new PagesController(_loggerFactory, _mapper, _pageServiceMock.Object);

        [Theory]
        [InlineAutoData]
        [InlineAutoData(SortOrder.Descending, null)]
        public async void GetPagesList_ReturnsFilteredPages_WhenModelStateIsValid(SortOrder sortOrder, int? showCount)
        {
            var pageFilter = new PageFilterDto()
            {
                SortOrder = sortOrder,
                ShowCount = showCount
            };
            var mockPages = _fixture.CreateMany<Page>(pageFilter.ShowCount.GetValueOrDefault()).ToList();

            _pageServiceMock.Setup(s => s.SearchPagesAsync(pageFilter, default))
                .ReturnsAsync(mockPages);

            var controller = PagesController;

            var result = await controller.GetPagesList(pageFilter, default);

            _pageServiceMock.Verify(s => s.SearchPagesAsync(pageFilter, default), Times.Once);

            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async void CreatePage_CreatesPageSuccessfully_WhenPageCanBeCreated()
        {
            var createPageInfo = _fixture.Create<PageCreateDto>();

            _pageServiceMock.Setup(s => s.PageCanBeCreatedAsync(createPageInfo, default))
                .ReturnsAsync(true);

            var controller = PagesController;

            var result = await controller.CreatePage(createPageInfo, default);

            _pageServiceMock.Verify(s => s.PageCanBeCreatedAsync(createPageInfo, default), Times.Once);
            _pageServiceMock.Verify(s => s.CreatePageAsync(It.IsNotNull<Page>(), default), Times.Once);

            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void CreatePage_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var createPageInfo = _fixture.Create<PageCreateDto>();
            var controller = PagesController;
            controller.ModelState.AddModelError("some", "error");

            var result = await controller.CreatePage(createPageInfo, default);

            _pageServiceMock.Verify(s => s.PageCanBeCreatedAsync(createPageInfo, default), Times.Never);
            _pageServiceMock.Verify(s => s.CreatePageAsync(It.IsNotNull<Page>(), default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void CreatePage_ReturnsBadRequest_WhenPageCannotBeCreated()
        {
            var createPageInfo = _fixture.Create<PageCreateDto>();

            _pageServiceMock.Setup(s => s.PageCanBeCreatedAsync(createPageInfo, default))
                .ReturnsAsync(false);

            var controller = PagesController;

            var result = await controller.CreatePage(createPageInfo, default);

            _pageServiceMock.Verify(s => s.PageCanBeCreatedAsync(createPageInfo, default), Times.Once);
            _pageServiceMock.Verify(s => s.CreatePageAsync(It.IsNotNull<Page>(), default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void EditPage_EditsPageSuccessfully_WhenPageCanBeUpdated()
        {
            var updatedPageInfo = _fixture.Create<PageEditDto>();
            var originalPage = _fixture.Create<Page>();

            _pageServiceMock.Setup(s => s.GetPageByIdAsync(updatedPageInfo.Id, default))
                .ReturnsAsync(originalPage);
            _pageServiceMock.Setup(s => s.PageCanBeUpdatedAsync(updatedPageInfo, originalPage, default))
                .ReturnsAsync(true);

            var controller = PagesController;

            var result = await controller.EditPage(updatedPageInfo, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(updatedPageInfo.Id, default), Times.Once);
            _pageServiceMock.Verify(s => s.PageCanBeUpdatedAsync(updatedPageInfo, originalPage, default), Times.Once);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Once);

            result.Should().BeOfType<OkResult>();
        }

        [Fact]
        public async void EditPage_ReturnsBadRequest_WhenModelStateIsInvalid()
        {
            var updatedPageInfo = _fixture.Create<PageEditDto>();
            var originalPage = _fixture.Create<Page>();
            var controller = PagesController;
            controller.ModelState.AddModelError("some", "error");

            var result = await controller.EditPage(updatedPageInfo, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(updatedPageInfo.Id, default), Times.Never);
            _pageServiceMock.Verify(s => s.PageCanBeUpdatedAsync(updatedPageInfo, originalPage, default), Times.Never);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void EditPage_ReturnsBadRequest_WhenPageCannotBeEdited()
        {
            var updatedPageInfo = _fixture.Create<PageEditDto>();
            var originalPage = _fixture.Create<Page>();

            _pageServiceMock.Setup(s => s.GetPageByIdAsync(updatedPageInfo.Id, default))
                .ReturnsAsync(originalPage);
            _pageServiceMock.Setup(s => s.PageCanBeUpdatedAsync(updatedPageInfo, originalPage, default))
                .ReturnsAsync(false);

            var controller = PagesController;

            var result = await controller.EditPage(updatedPageInfo, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(updatedPageInfo.Id, default), Times.Once);
            _pageServiceMock.Verify(s => s.PageCanBeUpdatedAsync(updatedPageInfo, originalPage, default), Times.Once);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async void EditPage_ReturnsNotFound_WhenRequestedPageNotFound()
        {
            var updatedPageInfo = _fixture.Create<PageEditDto>();
            var originalPage = _fixture.Create<Page>();

            _pageServiceMock.Setup(s => s.GetPageByIdAsync(updatedPageInfo.Id, default))
                .ReturnsAsync(null as Page);

            var controller = PagesController;

            var result = await controller.EditPage(updatedPageInfo, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(updatedPageInfo.Id, default), Times.Once);
            _pageServiceMock.Verify(s => s.PageCanBeUpdatedAsync(updatedPageInfo, originalPage, default), Times.Never);
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

            result.Should().BeOfType<BadRequestResult>();
        }
    }
}
