using System;
using System.Linq;
using System.Threading;
using AutoFixture;
using FluentAssertions;
using FoodDiary.API.Controllers.v1;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Controllers
{
    public class ExportsControllerTests
    {
        private readonly Mock<IExportService> _exportServiceMock;

        private readonly IFixture _fixture;

        public ExportsControllerTests()
        {
            _exportServiceMock = new Mock<IExportService>();
            _fixture = SetupFixture();
        }

        private IFixture SetupFixture()
        {
            return new Fixture();
        }

        public ExportsController ExportsController
        {
            get
            {
                return new ExportsController(_exportServiceMock.Object);
            }
        }

        [Theory]
        [InlineData("2020-05-06", "2020-05-07")]
        [InlineData("2020-05-06", "2020-05-06")]
        public async void ExportPagesPdf_ReturnsExportFileContent_WhenStartDateLessThanOrEqualEndDate(string startDateStr, string endDateStr)
        {
            var request = _fixture.Build<PagesExportRequestDto>()
                .With(r => r.StartDate, DateTime.Parse(startDateStr))
                .With(r => r.EndDate, DateTime.Parse(endDateStr))
                .Create();
            _exportServiceMock.Setup(s => s.GetExportPagesPdfContentsAsync(request.StartDate, request.EndDate, CancellationToken.None))
                .ReturnsAsync(_fixture.CreateMany<byte>().ToArray());

            var result = await ExportsController.ExportPagesPdf(request, CancellationToken.None);

            _exportServiceMock.Verify(s => s.GetExportPagesPdfContentsAsync(request.StartDate, request.EndDate, CancellationToken.None), Times.Once);
            result.Should().BeOfType<FileContentResult>();
        }

        [Theory]
        [InlineData("2020-05-07", "2020-05-06")]
        public async void ExportPagesPdf_ReturnsBadRequest_WhenStartDateGreaterThanEndDate(string startDateStr, string endDateStr)
        {
            var request = _fixture.Build<PagesExportRequestDto>()
                .With(r => r.StartDate, DateTime.Parse(startDateStr))
                .With(r => r.EndDate, DateTime.Parse(endDateStr))
                .Create();

            var result = await ExportsController.ExportPagesPdf(request, CancellationToken.None);

            _exportServiceMock.Verify(s => s.GetExportPagesPdfContentsAsync(request.StartDate, request.EndDate, CancellationToken.None), Times.Never);
            result.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
