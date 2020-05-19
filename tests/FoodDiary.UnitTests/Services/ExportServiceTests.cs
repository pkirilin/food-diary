using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using FluentAssertions;
using FoodDiary.API.Services;
using FoodDiary.API.Services.Implementation;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.UnitTests.Services.TestData;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Services
{
    public class ExportServiceTests
    {
        private readonly Mock<IPageRepository> _pageRepositoryMock;

        public ExportServiceTests()
        {
            _pageRepositoryMock = new Mock<IPageRepository>();
        }

        public IExportService Sut => new ExportService(_pageRepositoryMock.Object);

        [Theory]
        [MemberData(nameof(ExportServiceTestData.GetPagesForExport), MemberType = typeof(ExportServiceTestData))]
        public async void GetPagesForExport_ReturnsRequestedPagesWithoutCategories_WhenIncludeCategoryIsFalse(
            DateTime startDate,
            DateTime endDate,
            List<Page> sourcePages,
            List<Page> pagesForExportUnordered,
            List<Page> pagesForExport)
        {
            var pagesForExportQuery = pagesForExport.AsQueryable();

            _pageRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourcePages.AsQueryable());

            _pageRepositoryMock.Setup(r => r.LoadNotesWithProducts(It.IsNotNull<IQueryable<Page>>()))
                .Returns(pagesForExportUnordered.AsQueryable());

            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(pagesForExportQuery, CancellationToken.None))
                .ReturnsAsync(pagesForExport);

            var result = await Sut.GetPagesForExportAsync(startDate, endDate, false, CancellationToken.None);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProducts(It.IsNotNull<IQueryable<Page>>()), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProductsAndCategories(It.IsNotNull<IQueryable<Page>>()), Times.Never);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(pagesForExportQuery, CancellationToken.None), Times.Once);
            
            result.Should().Contain(pagesForExport);
        }

        [Theory]
        [MemberData(nameof(ExportServiceTestData.GetPagesForExport), MemberType = typeof(ExportServiceTestData))]
        public async void GetPagesForExport_ReturnsRequestedPagesWithCategories_WhenIncludeCategoryIsTrue(
            DateTime startDate,
            DateTime endDate,
            List<Page> sourcePages,
            List<Page> pagesForExportUnordered,
            List<Page> pagesForExport)
        {
            var pagesForExportQuery = pagesForExport.AsQueryable();

            _pageRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourcePages.AsQueryable());

            _pageRepositoryMock.Setup(r => r.LoadNotesWithProductsAndCategories(It.IsNotNull<IQueryable<Page>>()))
                .Returns(pagesForExportUnordered.AsQueryable());

            _pageRepositoryMock.Setup(r => r.GetListFromQueryAsync(pagesForExportQuery, CancellationToken.None))
                .ReturnsAsync(pagesForExport);

            var result = await Sut.GetPagesForExportAsync(startDate, endDate, true, CancellationToken.None);

            _pageRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProducts(It.IsNotNull<IQueryable<Page>>()), Times.Never);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProductsAndCategories(It.IsNotNull<IQueryable<Page>>()), Times.Once);
            _pageRepositoryMock.Verify(r => r.GetListFromQueryAsync(pagesForExportQuery, CancellationToken.None), Times.Once);

            result.Should().Contain(pagesForExport);
        }
    }
}
