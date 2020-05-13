using System;
using System.Linq;
using System.Threading;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;
using FoodDiary.Infrastructure.Services;
using FoodDiary.UnitTests.Customizations;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Services
{
    public class ExportServiceTests
    {
        private readonly Mock<IPageRepository> _pageRepositoryMock;

        private readonly IFixture _fixture;

        public ExportServiceTests()
        {
            _pageRepositoryMock = new Mock<IPageRepository>();
            _fixture = SetupFixture();
        }

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        public IExportService ExportService
            => new ExportService(_pageRepositoryMock.Object);

        [Fact]
        public async void GetPagesForExport_ReturnsRequestedPagesWithoutCategories_WhenIncludeCategoryIsFalse()
        {
            var startDate = _fixture.Create<DateTime>();
            var endDate = _fixture.Create<DateTime>();
            var pagesForExport = _fixture.CreateMany<Page>().ToList();
            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), CancellationToken.None))
                .ReturnsAsync(pagesForExport);

            var result = await ExportService.GetPagesForExportAsync(startDate, endDate, false, CancellationToken.None);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProducts(It.IsNotNull<IQueryable<Page>>()), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProductsAndCategories(It.IsNotNull<IQueryable<Page>>()), Times.Never);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), CancellationToken.None), Times.Once);
            result.Should().Contain(pagesForExport);
        }

        [Fact]
        public async void GetPagesForExport_ReturnsRequestedPagesWithCategories_WhenIncludeCategoryIsTrue()
        {
            var startDate = _fixture.Create<DateTime>();
            var endDate = _fixture.Create<DateTime>();
            var pagesForExport = _fixture.CreateMany<Page>().ToList();
            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), CancellationToken.None))
                .ReturnsAsync(pagesForExport);

            var result = await ExportService.GetPagesForExportAsync(startDate, endDate, true, CancellationToken.None);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProducts(It.IsNotNull<IQueryable<Page>>()), Times.Never);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProductsAndCategories(It.IsNotNull<IQueryable<Page>>()), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Page>>(), CancellationToken.None), Times.Once);
            result.Should().Contain(pagesForExport);
        }
    }
}
