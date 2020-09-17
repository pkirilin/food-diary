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
        [MemberData(nameof(RunPagesJsonImportTestData))]
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

            _pageRepositoryMock.Verify(r => r.CreateRange(createdPagesAfterImport), Times.Once);
            _pageRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(CancellationToken.None), Times.Once);
        }

        #region Test data

        public static IEnumerable<object[]> RunPagesJsonImportTestData
        {
            get
            {
                var fixture = Fixtures.Custom;

                var page1 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-19"))
                    .Create();
                var page2 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-20"))
                    .Create();
                var page3 = fixture.Build<Page>()
                    .With(p => p.Date, DateTime.Parse("2020-05-21"))
                    .Create();

                var pageJson1 = fixture.Build<PageJsonItem>()
                    .With(p => p.Date, DateTime.Parse("2020-05-19"))
                    .Create();
                var pageJson2 = fixture.Build<PageJsonItem>()
                    .With(p => p.Date, DateTime.Parse("2020-05-20"))
                    .Create();

                var product1 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 1")
                    .Create();
                var product2 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 2")
                    .Create();
                var product3 = fixture.Build<Product>()
                    .With(p => p.Name, "Product 3")
                    .Create();

                var category1 = fixture.Build<Category>()
                    .With(p => p.Name, "Category 1")
                    .Create();
                var category2 = fixture.Build<Category>()
                    .With(p => p.Name, "Category 2")
                    .Create();
                var category3 = fixture.Build<Category>()
                    .With(p => p.Name, "Category 3")
                    .Create();

                var sourcePages = new List<Page>() { page1, page2, page3 };
                var sourceProducts = new List<Product>() { product1, product2, product3 };
                var sourceCategories = new List<Category>() { category1, category2, category3 };

                var pagesFromJson = new List<PageJsonItem>() { pageJson1, pageJson2 };
                var notesFromJson = fixture.CreateMany<NoteJsonItem>().ToList();
                var productNamesFromJson = new List<string>() { "Product 1", "Product 2" };
                var categoryNamesFromJson = new List<string>() { "Category 1", "Category 2" };

                var existingPages = new List<Page>() { page1, page2 };
                var existingProducts = new List<Product>() { product1, product2 };
                var existingCategories = new List<Category>() { category1, category2 };

                var existingPagesDictionary = fixture.Create<Dictionary<DateTime, Page>>();
                var existingProductsDictionary = fixture.Create<Dictionary<string, Product>>();
                var existingCategoriesDictionary = fixture.Create<Dictionary<string, Category>>();

                var pagesJsonObj = fixture.Create<PagesJsonObject>();
                var createdPagesAfterImport = fixture.CreateMany<Page>().ToList();

                yield return new object[]
                {
                    pagesJsonObj,
                    pagesFromJson,
                    notesFromJson,
                    productNamesFromJson,
                    categoryNamesFromJson,
                    sourcePages,
                    sourceProducts,
                    sourceCategories,
                    existingPages,
                    existingProducts,
                    existingCategories,
                    existingPagesDictionary,
                    existingProductsDictionary,
                    existingCategoriesDictionary,
                    createdPagesAfterImport
                };
            }
        }

        #endregion
    }
}
