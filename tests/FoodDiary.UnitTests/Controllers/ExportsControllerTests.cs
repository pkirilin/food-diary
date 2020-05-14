using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading;
using AutoFixture;
using AutoMapper;
using FluentAssertions;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Services;
using FoodDiary.Domain.Entities;
using FoodDiary.PdfGenerator;
using FoodDiary.UnitTests.Customizations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;
using FoodDiary.API.Requests;

namespace FoodDiary.UnitTests.Controllers
{
    public class ExportsControllerTests
    {
        private readonly IMapper _mapper;

        private readonly Mock<IExportService> _exportServiceMock;
        private readonly Mock<IPagesPdfGenerator> _pagesPdfGeneratorMock;

        private readonly IFixture _fixture;

        public ExportsControllerTests()
        {
            var serviceProvider = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
            _exportServiceMock = new Mock<IExportService>();
            _pagesPdfGeneratorMock = new Mock<IPagesPdfGenerator>();
            _fixture = SetupFixture();
        }

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        public ExportsController ExportsController
        {
            get
            {
                return new ExportsController(_mapper, _exportServiceMock.Object, _pagesPdfGeneratorMock.Object);
            }
        }

        [Theory]
        [InlineData("2020-05-06", "2020-05-07")]
        [InlineData("2020-05-06", "2020-05-06")]
        public async void ExportPagesPdf_ReturnsExportFileContent_WhenStartDateLessThanOrEqualEndDate(string startDateStr, string endDateStr)
        {
            var request = _fixture.Build<PagesExportRequest>()
                .With(r => r.StartDate, DateTime.Parse(startDateStr))
                .With(r => r.EndDate, DateTime.Parse(endDateStr))
                .Create();
            var pagesForExport = _fixture.CreateMany<Page>();
            _exportServiceMock.Setup(s => s.GetPagesForExportAsync(request.StartDate, request.EndDate, false, CancellationToken.None))
                .ReturnsAsync(pagesForExport);

            var result = await ExportsController.ExportPagesPdf(request, CancellationToken.None);

            _exportServiceMock.Verify(s => s.GetPagesForExportAsync(request.StartDate, request.EndDate, false, CancellationToken.None), Times.Once);
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

            var result = await ExportsController.ExportPagesPdf(request, CancellationToken.None);

            _exportServiceMock.Verify(s => s.GetPagesForExportAsync(request.StartDate, request.EndDate, false, CancellationToken.None), Times.Never);
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
            var pagesForExport = _fixture.CreateMany<Page>();
            _exportServiceMock.Setup(s => s.GetPagesForExportAsync(request.StartDate, request.EndDate, true, CancellationToken.None))
                .ReturnsAsync(pagesForExport);

            var result = await ExportsController.ExportPagesJson(request, CancellationToken.None);

            _exportServiceMock.Verify(s => s.GetPagesForExportAsync(request.StartDate, request.EndDate, true, CancellationToken.None), Times.Once);
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

            var result = await ExportsController.ExportPagesJson(request, CancellationToken.None);

            _exportServiceMock.Verify(s => s.GetPagesForExportAsync(request.StartDate, request.EndDate, true, CancellationToken.None), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
