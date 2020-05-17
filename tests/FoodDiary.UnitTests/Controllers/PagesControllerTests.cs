using Xunit;
using Microsoft.Extensions.DependencyInjection;
using FoodDiary.API.Controllers.v1;
using AutoMapper;
using FoodDiary.API;
using System.Reflection;
using Moq;
using FoodDiary.Domain.Entities;
using System.Linq;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.Domain.Utils;
using FoodDiary.Infrastructure.Utils;
using FoodDiary.API.Services;
using FoodDiary.API.Requests;
using FoodDiary.UnitTests.Attributes;
using System.Collections.Generic;

namespace FoodDiary.UnitTests.Controllers
{
    public class PagesControllerTests
    {
        private readonly IMapper _mapper;

        private readonly Mock<IPageService> _pageServiceMock;

        public PagesControllerTests()
        {
            var serviceCollection = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .AddTransient<ICaloriesCalculator, CaloriesCalculator>();

            var serviceProvider = serviceCollection.BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
            _pageServiceMock = new Mock<IPageService>();
        }

        public PagesController Sut => new PagesController(
            _mapper,
            _pageServiceMock.Object);

        [Theory]
        [CustomAutoData]
        public async void GetPages_ReturnsFilteredPages_WhenModelStateIsValid(
            PagesSearchRequest request, IEnumerable<Page> filteredPages)
        {
            _pageServiceMock.Setup(s => s.SearchPagesAsync(request, default))
                .ReturnsAsync(filteredPages);

            var result = await Sut.GetPages(request, default);

            _pageServiceMock.Verify(s => s.SearchPagesAsync(request, default), Times.Once);

            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetPages_ReturnsBadRequest_WhenModelStateIsInvalid(
            PagesSearchRequest request, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.GetPages(request, default);

            _pageServiceMock.Verify(s => s.SearchPagesAsync(request, default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreatePage_CreatesPage(PageCreateEditRequest pageData, Page createdPage)
        {
            _pageServiceMock.Setup(s => s.IsPageExistsAsync(pageData.Date, default))
                .ReturnsAsync(false);

            _pageServiceMock.Setup(s => s.CreatePageAsync(It.IsNotNull<Page>(), default))
                .ReturnsAsync(createdPage);

            var result = await Sut.CreatePage(pageData, default);

            _pageServiceMock.Verify(s => s.IsPageExistsAsync(pageData.Date, default), Times.Once);
            _pageServiceMock.Verify(s => s.CreatePageAsync(It.IsNotNull<Page>(), default), Times.Once);

            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreatePage_ReturnsBadRequest_WhenModelStateIsInvalid(
            PageCreateEditRequest pageData, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.CreatePage(pageData, default);

            _pageServiceMock.Verify(s => s.IsPageExistsAsync(pageData.Date, default), Times.Never);
            _pageServiceMock.Verify(s => s.CreatePageAsync(It.IsNotNull<Page>(), default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreatePage_ReturnsBadRequest_WhenPageWithTheSameDateAlreadyExists(
            PageCreateEditRequest pageData)
        {
            _pageServiceMock.Setup(s => s.IsPageExistsAsync(pageData.Date, default))
                .ReturnsAsync(true);

            var result = await Sut.CreatePage(pageData, default);

            _pageServiceMock.Verify(s => s.IsPageExistsAsync(pageData.Date, default), Times.Once);
            _pageServiceMock.Verify(s => s.CreatePageAsync(It.IsNotNull<Page>(), default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditPage_UpdatesPage_WhenEditedPageIsValid(
            int pageId, PageCreateEditRequest updatedPageData, Page originalPage)
        {
            _pageServiceMock.Setup(s => s.GetPageByIdAsync(pageId, default))
                .ReturnsAsync(originalPage);

            _pageServiceMock.Setup(s => s.IsPageExistsAsync(updatedPageData.Date, default))
                .ReturnsAsync(false);

            _pageServiceMock.Setup(s => s.IsEditedPageValid(updatedPageData, originalPage, false))
                .Returns(true);

            var result = await Sut.EditPage(pageId, updatedPageData, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageId, default), Times.Once);
            _pageServiceMock.Verify(s => s.IsPageExistsAsync(updatedPageData.Date, default), Times.Once);
            _pageServiceMock.Verify(s => s.IsEditedPageValid(updatedPageData, originalPage, false), Times.Once);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Once);

            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditPage_ReturnsBadRequest_WhenModelStateIsInvalid(
            int pageId,
            PageCreateEditRequest updatedPageData,
            Page originalPage,
            string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.EditPage(pageId, updatedPageData, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageId, default), Times.Never);
            _pageServiceMock.Verify(s => s.IsPageExistsAsync(updatedPageData.Date, default), Times.Never);
            _pageServiceMock.Verify(s => s.IsEditedPageValid(updatedPageData, originalPage, It.IsAny<bool>()), Times.Never);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditPage_ReturnsBadRequest_WhenEditedPageIsInvalid(
            int pageId, PageCreateEditRequest updatedPageData, Page originalPage)
        {
            _pageServiceMock.Setup(s => s.GetPageByIdAsync(pageId, default))
                .ReturnsAsync(originalPage);

            _pageServiceMock.Setup(s => s.IsPageExistsAsync(updatedPageData.Date, default))
                .ReturnsAsync(true);

            _pageServiceMock.Setup(s => s.IsEditedPageValid(updatedPageData, originalPage, true))
                .Returns(false);

            var result = await Sut.EditPage(pageId, updatedPageData, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageId, default), Times.Once);
            _pageServiceMock.Verify(s => s.IsPageExistsAsync(updatedPageData.Date, default), Times.Once);
            _pageServiceMock.Verify(s => s.IsEditedPageValid(updatedPageData, originalPage, true), Times.Once);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Never);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditPage_ReturnsNotFound_WhenRequestedPageNotFound(
            int pageId, PageCreateEditRequest updatedPageData, Page originalPage)
        {
            _pageServiceMock.Setup(s => s.GetPageByIdAsync(pageId, default))
                .ReturnsAsync(null as Page);

            var result = await Sut.EditPage(pageId, updatedPageData, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageId, default), Times.Once);
            _pageServiceMock.Verify(s => s.IsPageExistsAsync(updatedPageData.Date, default), Times.Never);
            _pageServiceMock.Verify(s => s.IsEditedPageValid(updatedPageData, originalPage, It.IsAny<bool>()), Times.Never);
            _pageServiceMock.Verify(s => s.EditPageAsync(originalPage, default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeletePage_DeletesPage_WhenRequestedPageExists(
            int pageForDeleteId, Page pageForDelete)
        {
            _pageServiceMock.Setup(s => s.GetPageByIdAsync(pageForDeleteId, default))
                .ReturnsAsync(pageForDelete);

            var result = await Sut.DeletePage(pageForDeleteId, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageForDeleteId, default), Times.Once);
            _pageServiceMock.Verify(s => s.DeletePageAsync(pageForDelete, default), Times.Once);

            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeletePage_ReturnsNotFound_WhenRequestedPageDoesNotExist(
            int pageForDeleteId, Page pageForDelete)
        {
            _pageServiceMock.Setup(s => s.GetPageByIdAsync(pageForDeleteId, default))
                .ReturnsAsync(null as Page);

            var result = await Sut.DeletePage(pageForDeleteId, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(pageForDeleteId, default), Times.Once);
            _pageServiceMock.Verify(s => s.DeletePageAsync(pageForDelete, default), Times.Never);

            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeletePages_DeletesRequestedPages_WhenAllRequestedPagesAreFound(
            List<Page> pagesForDelete)
        {
            var pagesForDeleteIds = pagesForDelete.Select(p => p.Id).ToList();

            _pageServiceMock.Setup(s => s.GetPagesByIdsAsync(pagesForDeleteIds, default))
                .ReturnsAsync(pagesForDelete);

            var result = await Sut.DeletePages(pagesForDeleteIds, default);

            _pageServiceMock.Verify(s => s.GetPagesByIdsAsync(pagesForDeleteIds, default), Times.Once);
            _pageServiceMock.Verify(s => s.BatchDeletePagesAsync(pagesForDelete, default), Times.Once);

            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeletePages_ReturnsBadRequest_WhenAtLeastOneRequestedPageIsNotFound(
            List<Page> pagesForDelete)
        {
            var pagesForDeleteIds = pagesForDelete.Select(p => p.Id)
                .SkipLast(1)
                .ToList();

            _pageServiceMock.Setup(s => s.GetPagesByIdsAsync(pagesForDeleteIds, default))
                .ReturnsAsync(pagesForDelete);

            var result = await Sut.DeletePages(pagesForDeleteIds, default);

            _pageServiceMock.Verify(s => s.GetPagesByIdsAsync(pagesForDeleteIds, default), Times.Once);
            _pageServiceMock.Verify(s => s.BatchDeletePagesAsync(pagesForDelete, default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
