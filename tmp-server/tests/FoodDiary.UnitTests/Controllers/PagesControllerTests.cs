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
using FoodDiary.API.Requests;
using FoodDiary.UnitTests.Attributes;
using System.Collections.Generic;
using System;
using MediatR;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Application.Enums;
using AutoFixture;
using FoodDiary.Application.Models;

namespace FoodDiary.UnitTests.Controllers
{
    public class PagesControllerTests
    {
        private readonly IMapper _mapper;
        private readonly Mock<IMediator> _mediatorMock = new Mock<IMediator>();

        public PagesControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .AddTransient<ICaloriesCalculator, CaloriesCalculator>()
                .BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
        }

        public PagesController Sut => new PagesController(_mapper, _mediatorMock.Object);

        [Theory]
        [MemberData(nameof(MemberData_GetPages_ValidDateRanges))]
        public async void GetPages_ReturnsFilteredPages_WhenModelStateAndDateRangesAreValid(PagesSearchRequest request, PagesSearchResult pagesSearchResult)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetPagesRequest>(r => 
                    r.StartDate == request.StartDate
                    && r.EndDate == request.EndDate
                    && r.PageNumber == request.PageNumber
                    && r.PageSize == request.PageSize), default))
                .ReturnsAsync(pagesSearchResult);

            var result = await Sut.GetPages(request, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPagesRequest>(r =>
                    r.StartDate == request.StartDate
                    && r.EndDate == request.EndDate
                    && r.PageNumber == request.PageNumber
                    && r.PageSize == request.PageSize), default),
                Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetPages_ReturnsBadRequest_WhenModelStateIsInvalid(PagesSearchRequest request, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.GetPages(request, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetPagesRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [MemberData(nameof(MemberData_GetPages_InvalidDateRanges))]
        public async void GetPages_ReturnsBadRequest_WhenDateRangesAreInvalid(PagesSearchRequest request)
        {
            var result = await Sut.GetPages(request, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetPagesRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreatePage_CreatesPage(PageCreateEditRequest pageData, Page createdPage)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetPagesByExactDateRequest>(r => r.Date == pageData.Date), default))
                .ReturnsAsync(new List<Page>());
            _mediatorMock.Setup(m => m.Send(It.IsNotNull<CreatePageRequest>(), default))
                .ReturnsAsync(createdPage);

            var result = await Sut.CreatePage(pageData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPagesByExactDateRequest>(r => r.Date == pageData.Date), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsNotNull<CreatePageRequest>(), default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreatePage_ReturnsBadRequest_WhenModelStateIsInvalid(PageCreateEditRequest pageData, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.CreatePage(pageData, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetPagesByExactDateRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<CreatePageRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreatePage_ReturnsBadRequest_WhenPageWithTheSameDateAlreadyExists(
            PageCreateEditRequest pageData,
            List<Page> pagesWithTheSameDate)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetPagesByExactDateRequest>(r => r.Date == pageData.Date), default))
                .ReturnsAsync(pagesWithTheSameDate);

            var result = await Sut.CreatePage(pageData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPagesByExactDateRequest>(r => r.Date == pageData.Date), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<CreatePageRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [MemberData(nameof(MemberData_EditPage_ValidUpdatedPage))]
        public async void EditPage_UpdatesPage_WhenEditedPageIsValid(
            int pageId,
            PageCreateEditRequest updatedPageData,
            Page originalPage,
            List<Page> pagesWithTheSameDate)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetPageByIdRequest>(r => r.Id == pageId), default))
                .ReturnsAsync(originalPage);
            _mediatorMock.Setup(m => m.Send(It.Is<GetPagesByExactDateRequest>(r => r.Date == updatedPageData.Date), default))
                .ReturnsAsync(pagesWithTheSameDate);

            var result = await Sut.EditPage(pageId, updatedPageData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPageByIdRequest>(r => r.Id == pageId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<GetPagesByExactDateRequest>(r => r.Date == updatedPageData.Date), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsNotNull<EditPageRequest>(), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditPage_ReturnsBadRequest_WhenModelStateIsInvalid(
            int pageId,
            PageCreateEditRequest updatedPageData,
            string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.EditPage(pageId, updatedPageData, default);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetPageByIdRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<GetPagesByExactDateRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditPageRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditPage_ReturnsNotFound_WhenRequestedPageNotFound(
            int pageId,
            PageCreateEditRequest updatedPageData)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetPageByIdRequest>(r => r.Id == pageId), default))
                .ReturnsAsync(null as Page);

            var result = await Sut.EditPage(pageId, updatedPageData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPageByIdRequest>(r => r.Id == pageId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<GetPagesByExactDateRequest>(), default), Times.Never);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditPageRequest>(), default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [MemberData(nameof(MemberData_EditPage_InvalidUpdatedPage))]
        public async void EditPage_ReturnsBadRequest_WhenEditedPageIsInvalid(
            int pageId,
            PageCreateEditRequest updatedPageData,
            Page originalPage,
            List<Page> pagesWithTheSameDate)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetPageByIdRequest>(r => r.Id == pageId), default))
                .ReturnsAsync(originalPage);
            _mediatorMock.Setup(m => m.Send(It.Is<GetPagesByExactDateRequest>(r => r.Date == updatedPageData.Date), default))
                .ReturnsAsync(pagesWithTheSameDate);

            var result = await Sut.EditPage(pageId, updatedPageData, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPageByIdRequest>(r => r.Id == pageId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<GetPagesByExactDateRequest>(r => r.Date == updatedPageData.Date), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<EditPageRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeletePage_DeletesPage_WhenRequestedPageExists(int pageForDeleteId, Page pageForDelete)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetPageByIdRequest>(r => r.Id == pageForDeleteId), default))
                .ReturnsAsync(pageForDelete);

            var result = await Sut.DeletePage(pageForDeleteId, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPageByIdRequest>(r => r.Id == pageForDeleteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<DeletePageRequest>(r => r.Entity == pageForDelete), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeletePage_ReturnsNotFound_WhenRequestedPageDoesNotExist(int pageForDeleteId)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetPageByIdRequest>(r => r.Id == pageForDeleteId), default))
                .ReturnsAsync(null as Page);

            var result = await Sut.DeletePage(pageForDeleteId, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPageByIdRequest>(r => r.Id == pageForDeleteId), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.IsAny<DeletePageRequest>(), default), Times.Never);
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeletePages_DeletesRequestedPages_WhenAllRequestedPagesAreFound(
            ICollection<int> pagesForDeleteIds,
            List<Page> pagesForDelete)
        {
            _mediatorMock.Setup(m => m.Send(It.Is<GetPagesByIdsRequest>(r => r.Ids == pagesForDeleteIds), default))
                .ReturnsAsync(pagesForDelete);

            var result = await Sut.DeletePages(pagesForDeleteIds, default);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPagesByIdsRequest>(r => r.Ids == pagesForDeleteIds), default), Times.Once);
            _mediatorMock.Verify(m => m.Send(It.Is<DeletePagesRequest>(r => r.Entities == pagesForDelete), default), Times.Once);
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetDateForNewPage_ReturnsRequestedDate(DateTime dateForNewPage)
        {
            _mediatorMock.Setup(m => m.Send(It.IsNotNull<GetDateForNewPageRequest>(), default))
                .ReturnsAsync(dateForNewPage);

            var result = await Sut.GetDateForNewPage(default);

            _mediatorMock.Verify(m => m.Send(It.IsNotNull<GetDateForNewPageRequest>(), default), Times.Once);
            result.Should().BeOfType<OkObjectResult>();
        }

        #region Test data

        public static IEnumerable<object[]> MemberData_GetPages_ValidDateRanges
        {
            get
            {
                var fixture = Fixtures.Custom;

                var searchRequest1 = fixture.Build<PagesSearchRequest>()
                    .With(r => r.StartDate, DateTime.Parse("2020-08-30"))
                    .With(r => r.EndDate, DateTime.Parse("2020-08-31"))
                    .Create();
                var searchResult1 = fixture.Create<PagesSearchResult>();

                var searchRequest2 = fixture.Build<PagesSearchRequest>()
                    .With(r => r.StartDate, DateTime.Parse("2020-08-30"))
                    .With(r => r.EndDate, DateTime.Parse("2020-08-30"))
                    .Create();
                var searchResult2 = fixture.Create<PagesSearchResult>();

                var searchRequest3 = fixture.Build<PagesSearchRequest>()
                    .Without(r => r.StartDate)
                    .Without(r => r.EndDate)
                    .Create();
                var searchResult3 = fixture.Create<PagesSearchResult>();

                yield return new object[] { searchRequest1, searchResult1 };
                yield return new object[] { searchRequest2, searchResult2 };
                yield return new object[] { searchRequest3, searchResult3 };
            }
        }

        public static IEnumerable<object[]> MemberData_GetPages_InvalidDateRanges
        {
            get
            {
                var fixture = Fixtures.Custom;

                var searchRequest = fixture.Build<PagesSearchRequest>()
                    .With(r => r.StartDate, DateTime.Parse("2020-08-30"))
                    .With(r => r.EndDate, DateTime.Parse("2020-08-29"))
                    .Create();

                yield return new object[] { searchRequest };
            }
        }

        public static IEnumerable<object[]> MemberData_EditPage_ValidUpdatedPage
        {
            get
            {
                var fixture = Fixtures.Custom;

                var pageId1 = fixture.Create<int>();
                var updatedPageData1 = fixture.Build<PageCreateEditRequest>()
                    .With(p => p.Date, DateTime.Parse("2020-08-30"))
                    .Create();
                var originalPage1 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-08-30"))
                    .Create();
                var pagesWithTheSameDate1 = fixture.CreateMany<Page>().ToList();

                var pageId2 = fixture.Create<int>();
                var updatedPageData2 = fixture.Build<PageCreateEditRequest>()
                    .With(p => p.Date, DateTime.Parse("2020-08-30"))
                    .Create();
                var originalPage2 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-08-31"))
                    .Create();
                var pagesWithTheSameDate2 = new List<Page>();

                yield return new object[] { pageId1, updatedPageData1, originalPage1, pagesWithTheSameDate1 };
                yield return new object[] { pageId2, updatedPageData2, originalPage2, pagesWithTheSameDate2 };
            }
        }

        public static IEnumerable<object[]> MemberData_EditPage_InvalidUpdatedPage
        {
            get
            {
                var fixture = Fixtures.Custom;

                var pageId = fixture.Create<int>();
                var updatedPageData = fixture.Build<PageCreateEditRequest>()
                    .With(p => p.Date, DateTime.Parse("2020-08-30"))
                    .Create();
                var originalPage = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-08-31"))
                    .Create();
                var pagesWithTheSameDate = fixture.CreateMany<Page>().ToList();

                yield return new object[] { pageId, updatedPageData, originalPage, pagesWithTheSameDate };
            }
        }

        #endregion
    }
}
