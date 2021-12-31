using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading;
using AutoFixture;
using AutoMapper;
using FluentAssertions;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.Domain.Entities;
using FoodDiary.PdfGenerator;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;
using FoodDiary.API.Requests;
using MediatR;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Application.Enums;
using System.Linq;

namespace FoodDiary.UnitTests.Controllers
{
    public class ExportsControllerTests
    {
        private readonly IMapper _mapper;
        private readonly Mock<IMediator> _mediatorMock = new Mock<IMediator>();
        private readonly Mock<IPagesPdfGenerator> _pagesPdfGeneratorMock = new Mock<IPagesPdfGenerator>();

        private readonly IFixture _fixture = Fixtures.Custom;

        public ExportsControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
        }

        public ExportsController Sut => new ExportsController(
            _mapper, 
            _mediatorMock.Object, 
            _pagesPdfGeneratorMock.Object);

        [Theory]
        [InlineData("2020-05-06", "2020-05-07")]
        [InlineData("2020-05-06", "2020-05-06")]
        public async void ExportPagesPdf_ReturnsExportFileContent_WhenStartDateLessThanOrEqualEndDate(string startDateStr, string endDateStr)
        {
            var request = _fixture.Build<PagesExportRequest>()
                .With(r => r.StartDate, DateTime.Parse(startDateStr))
                .With(r => r.EndDate, DateTime.Parse(endDateStr))
                .Create();
            var pagesForExport = _fixture.CreateMany<Page>().ToList();

            _mediatorMock.Setup(m => m.Send(It.Is<GetPagesForExportRequest>(r =>
                    r.StartDate == request.StartDate
                    && r.EndDate == request.EndDate
                    && r.LoadType == PagesLoadRequestType.OnlyNotesWithProducts), default))
                .ReturnsAsync(pagesForExport);

            var result = await Sut.ExportPagesPdf(request, CancellationToken.None);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPagesForExportRequest>(r =>
                    r.StartDate == request.StartDate
                    && r.EndDate == request.EndDate
                    && r.LoadType == PagesLoadRequestType.OnlyNotesWithProducts), default)
                , Times.Once);
            _pagesPdfGeneratorMock.Verify(g => g.GeneratePdfForPages(pagesForExport), Times.Once);            
            result.Should().BeOfType<FileContentResult>();
        }

        [Theory]
        [InlineData("2020-05-07", "2020-05-06")]
        public async void ExportPagesPdf_ReturnsBadRequest_WhenStartDateGreaterThanEndDate(string startDateStr, string endDateStr)
        {
            var request = _fixture.Build<PagesExportRequest>()
                .With(r => r.StartDate, DateTime.Parse(startDateStr))
                .With(r => r.EndDate, DateTime.Parse(endDateStr))
                .Create();

            var result = await Sut.ExportPagesPdf(request, CancellationToken.None);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetPagesForExportRequest>(), default), Times.Never);
            _pagesPdfGeneratorMock.Verify(g => g.GeneratePdfForPages(It.IsAny<IEnumerable<Page>>()), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [InlineData("2020-05-06", "2020-05-07")]
        [InlineData("2020-05-06", "2020-05-06")]
        public async void ExportPagesJson_ReturnsExportFileContent_WhenStartDateLessThanOrEqualEndDate(string startDateStr, string endDateStr)
        {
            var request = _fixture.Build<PagesExportRequest>()
                .With(r => r.StartDate, DateTime.Parse(startDateStr))
                .With(r => r.EndDate, DateTime.Parse(endDateStr))
                .Create();
            var pagesForExport = _fixture.CreateMany<Page>().ToList();

            _mediatorMock.Setup(m => m.Send(It.Is<GetPagesForExportRequest>(r =>
                    r.StartDate == request.StartDate
                    && r.EndDate == request.EndDate
                    && r.LoadType == PagesLoadRequestType.All), default))
                .ReturnsAsync(pagesForExport);

            var result = await Sut.ExportPagesJson(request, CancellationToken.None);

            _mediatorMock.Verify(m => m.Send(It.Is<GetPagesForExportRequest>(r =>
                    r.StartDate == request.StartDate
                    && r.EndDate == request.EndDate
                    && r.LoadType == PagesLoadRequestType.All), default)
                , Times.Once);
            result.Should().BeOfType<FileContentResult>();
        }

        [Theory]
        [InlineData("2020-05-07", "2020-05-06")]
        public async void ExportPagesJson_ReturnsBadRequest_WhenStartDateGreaterThanEndDate(string startDateStr, string endDateStr)
        {
            var request = _fixture.Build<PagesExportRequest>()
                .With(r => r.StartDate, DateTime.Parse(startDateStr))
                .With(r => r.EndDate, DateTime.Parse(endDateStr))
                .Create();

            var result = await Sut.ExportPagesJson(request, CancellationToken.None);

            _mediatorMock.Verify(m => m.Send(It.IsAny<GetPagesForExportRequest>(), default), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
