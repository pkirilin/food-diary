using System;
using System.Linq;
using System.Threading;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;
using FoodDiary.Infrastructure.Services;
using FoodDiary.Pdf;
using FoodDiary.UnitTests.Customizations;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Services
{
    public class ExportServiceTests
    {
        private readonly Mock<IPageRepository> _pageRepositoryMock;
        private readonly Mock<IPagesPdfGenerator> _pagesPdfGeneratorMock;

        private readonly IFixture _fixture;

        public ExportServiceTests()
        {
            _pageRepositoryMock = new Mock<IPageRepository>();
            _pagesPdfGeneratorMock = new Mock<IPagesPdfGenerator>();
            _fixture = SetupFixture();
        }

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        public IExportService ExportService
            => new ExportService(_pageRepositoryMock.Object, _pagesPdfGeneratorMock.Object);

        [Fact]
        public async void GetExportPagesPdfContents_ReturnsPagesPdfFileBytes()
        {
            var startDate = _fixture.Create<DateTime>();
            var endDate = _fixture.Create<DateTime>();
            var pagesForExport = _fixture.CreateMany<Page>();
            var pdfFileBytes = _fixture.CreateMany<byte>().ToArray();
            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), CancellationToken.None))
                .ReturnsAsync(pagesForExport);
            _pagesPdfGeneratorMock.Setup(g => g.GeneratePdfForPages(pagesForExport))
                .Returns(pdfFileBytes);

            var result = await ExportService.GetExportPagesPdfContentsAsync(startDate, endDate, CancellationToken.None);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProducts(It.IsNotNull<IQueryable<Page>>()), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), CancellationToken.None), Times.Once);
            _pagesPdfGeneratorMock.Verify(g => g.GeneratePdfForPages(pagesForExport), Times.Once);
            result.Should().Contain(pdfFileBytes);
        }
    }
}
