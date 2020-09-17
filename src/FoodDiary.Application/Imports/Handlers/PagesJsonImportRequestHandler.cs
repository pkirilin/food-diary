using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Imports.Requests;
using MediatR;
using System.Linq;
using FoodDiary.Domain.Repositories;
using FoodDiary.Import;

namespace FoodDiary.Application.Imports.Handlers
{
    class PagesJsonImportRequestHandler : IRequestHandler<PagesJsonImportRequest, int>
    {
        private readonly IPageRepository _pageRepository;
        private readonly IProductRepository _productRepository;
        private readonly ICategoryRepository _categoryRepository;

        private readonly IJsonParser _jsonParser;
        private readonly IJsonImportDataProvider _importDataProvider;
        private readonly IJsonImporter _jsonImporter;

        public PagesJsonImportRequestHandler(
            IPageRepository pageRepository,
            IProductRepository productRepository,
            ICategoryRepository categoryRepository,
            IJsonParser pagesJsonParser,
            IJsonImportDataProvider importDataProvider,
            IJsonImporter pagesJsonEntitiesUpdater)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
            _jsonParser = pagesJsonParser ?? throw new ArgumentNullException(nameof(pagesJsonParser));
            _importDataProvider = importDataProvider ?? throw new ArgumentNullException(nameof(importDataProvider));
            _jsonImporter = pagesJsonEntitiesUpdater ?? throw new ArgumentNullException(nameof(pagesJsonEntitiesUpdater));
        }

        public async Task<int> Handle(PagesJsonImportRequest request, CancellationToken cancellationToken)
        {
            // Checking if data from json object valid
            var pagesFromJson = _jsonParser.ParsePages(request.JsonObj);
            var notesFromJson = _jsonParser.ParseNotes(pagesFromJson);
            var productNamesFromJson = _jsonParser.ParseProducts(notesFromJson);
            var categoryNamesFromJson = _jsonParser.ParseCategories(notesFromJson);
            var pagesFromJsonDates = pagesFromJson.Select(p => p.Date);

            // Preparing queries for entities which are going to be updated
            var pagesForUpdateQuery = _pageRepository.GetQuery()
                .Where(p => pagesFromJsonDates.Contains(p.Date));
            var importProductsQuery = _productRepository.GetQuery()
                .Where(p => productNamesFromJson.Contains(p.Name));
            var importCategoriesQuery = _categoryRepository.GetQuery()
                .Where(c => categoryNamesFromJson.Contains(c.Name));

            pagesForUpdateQuery = _pageRepository.LoadNotesWithProductsAndCategories(pagesForUpdateQuery);

            // Loading entities for update to data provider
            _importDataProvider.ExistingPages = await _pageRepository.GetDictionaryFromQueryAsync(pagesForUpdateQuery, cancellationToken);
            _importDataProvider.ExistingProducts = await _productRepository.GetDictionaryFromQueryAsync(importProductsQuery, cancellationToken);
            _importDataProvider.ExistingCategories = await _categoryRepository.GetDictionaryFromQueryAsync(importCategoriesQuery, cancellationToken);

            _jsonImporter.Import(request.JsonObj, out var createdPages);

            _pageRepository.CreateRange(createdPages);
            return await _pageRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
