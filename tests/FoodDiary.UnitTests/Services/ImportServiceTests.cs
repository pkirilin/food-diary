using System.Collections.Generic;
using System.Linq;
using System.Threading;
using AutoFixture;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;
using FoodDiary.Import;
using FoodDiary.Infrastructure.Services;
using FoodDiary.UnitTests.Customizations;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Services
{
    public class ImportServiceTests
    {
        private readonly Mock<IPageRepository> _pageRepositoryMock;
        private readonly Mock<IProductRepository> _productRepositoryMock;
        private readonly Mock<ICategoryRepository> _categoryRepositoryMock;
        private readonly Mock<IJsonParser> _jsonParserMock;
        private readonly Mock<IJsonImportDataProvider> _importDataProviderMock;
        private readonly Mock<IJsonImporter> _jsonImporterMock;

        private readonly IFixture _fixture;

        delegate void JsonImporterMockingCallback(PagesJsonObjectDto jsonObj, out List<Page> createdPages);

        public ImportServiceTests()
        {
            _pageRepositoryMock = new Mock<IPageRepository>();
            _productRepositoryMock = new Mock<IProductRepository>();
            _categoryRepositoryMock = new Mock<ICategoryRepository>();
            _jsonParserMock = new Mock<IJsonParser>();
            _importDataProviderMock = new Mock<IJsonImportDataProvider>();
            _jsonImporterMock = new Mock<IJsonImporter>();
            _fixture = SetupFixture();

            _pageRepositoryMock.SetupGet(r => r.UnitOfWork)
                .Returns(new Mock<IUnitOfWork>().Object);
        }

        IImportService Service => new ImportService(
            _pageRepositoryMock.Object,
            _productRepositoryMock.Object,
            _categoryRepositoryMock.Object,
            _jsonParserMock.Object,
            _importDataProviderMock.Object,
            _jsonImporterMock.Object);

        private IFixture SetupFixture()
        {
            var _fixture = new Fixture();
            _fixture.Customize(new FixtureWithCircularReferencesCustomization());
            return _fixture;
        }

        [Fact]
        public async void RunPagesJsonImportAsync_ImportsEntities()
        {
            var jsonObj = _fixture.Create<PagesJsonObjectDto>();
            var pagesFromJson = _fixture.CreateMany<PageJsonItemDto>();
            var notesFromJson = _fixture.CreateMany<NoteJsonItemDto>();
            var productNamesFromJson = _fixture.CreateMany<string>();
            var categoryNamesFromJson = _fixture.CreateMany<string>();

            var pagesQuery = _fixture.CreateMany<Page>().AsQueryable();
            var productsQuery = _fixture.CreateMany<Product>().AsQueryable();
            var categoriesQuery = _fixture.CreateMany<Category>().AsQueryable();
            var pagesForUpdateQuery = _fixture.CreateMany<Page>().AsQueryable();

            var existingPagesDictionary = _fixture.CreateMany<Page>().ToDictionary(p => p.Date);
            var existingProductsDictionary = _fixture.CreateMany<Product>().ToDictionary(p => p.Name);
            var existingCategoriesDictionary = _fixture.CreateMany<Category>().ToDictionary(p => p.Name);

            var createdPagesBeforeImport = _fixture.CreateMany<Page>().ToList();
            var createdPagesAfterImport = _fixture.CreateMany<Page>().ToList();

            _jsonParserMock.Setup(p => p.ParsePages(jsonObj))
                .Returns(pagesFromJson);
            _jsonParserMock.Setup(p => p.ParseNotes(pagesFromJson))
                .Returns(notesFromJson);
            _jsonParserMock.Setup(p => p.ParseProducts(notesFromJson))
                .Returns(productNamesFromJson);
            _jsonParserMock.Setup(p => p.ParseCategories(notesFromJson))
                .Returns(categoryNamesFromJson);

            _pageRepositoryMock.Setup(r => r.GetQuery())
                .Returns(pagesQuery);
            _productRepositoryMock.Setup(r => r.GetQuery())
                .Returns(productsQuery);
            _categoryRepositoryMock.Setup(r => r.GetQuery())
                .Returns(categoriesQuery);
            _pageRepositoryMock.Setup(r => r.LoadNotesWithProductsAndCategories(It.IsNotNull<IQueryable<Page>>()))
                .Returns(pagesForUpdateQuery);

            _pageRepositoryMock.Setup(r => r.GetDictionaryFromQueryAsync(pagesForUpdateQuery, CancellationToken.None))
                .ReturnsAsync(existingPagesDictionary);
            _productRepositoryMock.Setup(r => r.GetDictionaryFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), CancellationToken.None))
                .ReturnsAsync(existingProductsDictionary);
            _categoryRepositoryMock.Setup(r => r.GetDictionaryFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), CancellationToken.None))
                .ReturnsAsync(existingCategoriesDictionary);

            _jsonImporterMock.Setup(i => i.Import(jsonObj, out createdPagesBeforeImport))
                .Callback(new JsonImporterMockingCallback((PagesJsonObjectDto jsonObj, out List<Page> createdPages) =>
                {
                    createdPages = createdPagesAfterImport;
                }));

            await Service.RunPagesJsonImportAsync(jsonObj, CancellationToken.None);

            _jsonParserMock.Verify(p => p.ParsePages(jsonObj), Times.Once);
            _jsonParserMock.Verify(p => p.ParseNotes(pagesFromJson), Times.Once);
            _jsonParserMock.Verify(p => p.ParseProducts(notesFromJson), Times.Once);
            _jsonParserMock.Verify(p => p.ParseCategories(notesFromJson), Times.Once);

            _pageRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _productRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProductsAndCategories(It.IsNotNull<IQueryable<Page>>()), Times.Once);

            _pageRepositoryMock.Verify(r => r.GetDictionaryFromQueryAsync(pagesForUpdateQuery, CancellationToken.None), Times.Once);
            _productRepositoryMock.Verify(r => r.GetDictionaryFromQueryAsync(It.IsNotNull<IQueryable<Product>>(), CancellationToken.None), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetDictionaryFromQueryAsync(It.IsNotNull<IQueryable<Category>>(), CancellationToken.None), Times.Once);

            _importDataProviderMock.VerifySet(p => p.ExistingPages = existingPagesDictionary, Times.Once);
            _importDataProviderMock.VerifySet(p => p.ExistingProducts = existingProductsDictionary, Times.Once);
            _importDataProviderMock.VerifySet(p => p.ExistingCategories = existingCategoriesDictionary, Times.Once);

            _jsonImporterMock.Verify(i => i.Import(jsonObj, out createdPagesBeforeImport), Times.Once);

            _pageRepositoryMock.Verify(r => r.AddRange(createdPagesAfterImport), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(CancellationToken.None), Times.Once);
        }
    }
}
