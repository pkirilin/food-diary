using System.Collections.Generic;
using System.Linq;
using System.Threading;
using AutoFixture;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Import;
using Moq;
using Xunit;
using FoodDiary.Import.Models;
using System;
using FoodDiary.UnitTests.Services.TestData;
using MediatR;
using FoodDiary.Application.Imports.Requests;
using FoodDiary.Application.Imports.Handlers;

namespace FoodDiary.UnitTests.Handlers
{
    public class ImportsRequestHandlersTests
    {
        private readonly Mock<IPageRepository> _pageRepositoryMock;
        private readonly Mock<IProductRepository> _productRepositoryMock;
        private readonly Mock<ICategoryRepository> _categoryRepositoryMock;
        private readonly Mock<IJsonParser> _jsonParserMock;
        private readonly Mock<IJsonImportDataProvider> _importDataProviderMock;
        private readonly Mock<IJsonImporter> _jsonImporterMock;

        private readonly IFixture _fixture = Fixtures.Custom;

        delegate void JsonImporterMockingCallback(PagesJsonObject jsonObj, out List<Page> createdPages);

        public ImportsRequestHandlersTests()
        {
            _pageRepositoryMock = new Mock<IPageRepository>();
            _productRepositoryMock = new Mock<IProductRepository>();
            _categoryRepositoryMock = new Mock<ICategoryRepository>();
            _jsonParserMock = new Mock<IJsonParser>();
            _importDataProviderMock = new Mock<IJsonImportDataProvider>();
            _jsonImporterMock = new Mock<IJsonImporter>();

            _pageRepositoryMock.SetupGet(r => r.UnitOfWork).Returns(new Mock<IUnitOfWork>().Object);
        }

        IRequestHandler<PagesJsonImportRequest, int> CreatePagesJsonImportRequestHandler()
        {
            return new PagesJsonImportRequestHandler(
                _pageRepositoryMock.Object,
                _productRepositoryMock.Object,
                _categoryRepositoryMock.Object,
                _jsonParserMock.Object,
                _importDataProviderMock.Object,
                _jsonImporterMock.Object);
        }

        [Theory]
        [MemberData(nameof(ImportServiceTestData.RunPagesJsonImport), MemberType = typeof(ImportServiceTestData))]
        public async void RunPagesJsonImport_ImportsEntities(
            PagesJsonObject jsonObj,
            List<PageJsonItem> pagesFromJson,
            List<NoteJsonItem> notesFromJson,
            List<string> productNamesFromJson,
            List<string> categoryNamesFromJson,
            List<Page> sourcePages,
            List<Product> sourceProducts,
            List<Category> sourceCategories,
            List<Page> existingPages,
            List<Product> existingProducts,
            List<Category> existingCategories,
            Dictionary<DateTime, Page> existingPagesDictionary,
            Dictionary<string, Product> existingProductsDictionary,
            Dictionary<string, Category> existingCategoriesDictionary,
            List<Page> createdPagesAfterImport)
        {
            var existingPagesQuery = existingPages.AsQueryable();
            var existingProductsQuery = existingProducts.AsQueryable();
            var existingCategoriesQuery = existingCategories.AsQueryable();
            var createdPagesBeforeImport = _fixture.CreateMany<Page>().ToList();
            var handler = CreatePagesJsonImportRequestHandler();

            _jsonParserMock.Setup(p => p.ParsePages(jsonObj))
                .Returns(pagesFromJson);
            _jsonParserMock.Setup(p => p.ParseNotes(pagesFromJson))
                .Returns(notesFromJson);
            _jsonParserMock.Setup(p => p.ParseProducts(notesFromJson))
                .Returns(productNamesFromJson);
            _jsonParserMock.Setup(p => p.ParseCategories(notesFromJson))
                .Returns(categoryNamesFromJson);

            _pageRepositoryMock.Setup(r => r.GetQuery())
                .Returns(sourcePages.AsQueryable());
            _productRepositoryMock.Setup(r => r.GetQuery())
                .Returns(sourceProducts.AsQueryable());
            _categoryRepositoryMock.Setup(r => r.GetQuery())
                .Returns(sourceCategories.AsQueryable());

            _pageRepositoryMock.Setup(r => r.LoadNotesWithProductsAndCategories(existingPagesQuery))
                .Returns(existingPagesQuery);

            _pageRepositoryMock.Setup(r => r.GetDictionaryFromQueryAsync(existingPagesQuery, CancellationToken.None))
                .ReturnsAsync(existingPagesDictionary);
            _productRepositoryMock.Setup(r => r.GetDictionaryFromQueryAsync(existingProductsQuery, CancellationToken.None))
                .ReturnsAsync(existingProductsDictionary);
            _categoryRepositoryMock.Setup(r => r.GetDictionaryFromQueryAsync(existingCategoriesQuery, CancellationToken.None))
                .ReturnsAsync(existingCategoriesDictionary);

            _jsonImporterMock.Setup(i => i.Import(jsonObj, out createdPagesBeforeImport))
                .Callback(new JsonImporterMockingCallback((PagesJsonObject jsonObj, out List<Page> createdPages) =>
                {
                    createdPages = createdPagesAfterImport;
                }));

            await handler.Handle(new PagesJsonImportRequest(jsonObj), CancellationToken.None);

            _jsonParserMock.Verify(p => p.ParsePages(jsonObj), Times.Once);
            _jsonParserMock.Verify(p => p.ParseNotes(pagesFromJson), Times.Once);
            _jsonParserMock.Verify(p => p.ParseProducts(notesFromJson), Times.Once);
            _jsonParserMock.Verify(p => p.ParseCategories(notesFromJson), Times.Once);

            _pageRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _productRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _pageRepositoryMock.Verify(r => r.LoadNotesWithProductsAndCategories(existingPagesQuery), Times.Once);

            _pageRepositoryMock.Verify(r => r.GetDictionaryFromQueryAsync(existingPagesQuery, CancellationToken.None), Times.Once);
            _productRepositoryMock.Verify(r => r.GetDictionaryFromQueryAsync(existingProductsQuery, CancellationToken.None), Times.Once);
            _categoryRepositoryMock.Verify(r => r.GetDictionaryFromQueryAsync(existingCategoriesQuery, CancellationToken.None), Times.Once);

            _importDataProviderMock.VerifySet(p => p.ExistingPages = existingPagesDictionary, Times.Once);
            _importDataProviderMock.VerifySet(p => p.ExistingProducts = existingProductsDictionary, Times.Once);
            _importDataProviderMock.VerifySet(p => p.ExistingCategories = existingCategoriesDictionary, Times.Once);

            _jsonImporterMock.Verify(i => i.Import(jsonObj, out createdPagesBeforeImport), Times.Once);

            _pageRepositoryMock.Verify(r => r.AddRange(createdPagesAfterImport), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(CancellationToken.None), Times.Once);
        }
    }
}
