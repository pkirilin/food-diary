using System;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Services;

namespace FoodDiary.Import.Implementation
{
    class ProductJsonImporter : IProductJsonImporter
    {
        private readonly IJsonImportDataProvider _importDataProvider;

        private readonly ICategoryJsonImporter _categoryImporter;

        public ProductJsonImporter(IJsonImportDataProvider importDataProvider, ICategoryJsonImporter categoryImporter)
        {
            _importDataProvider = importDataProvider ?? throw new ArgumentNullException(nameof(importDataProvider));
            _categoryImporter = categoryImporter ?? throw new ArgumentNullException(nameof(categoryImporter));
        }

        public Product ImportProduct(JsonExportProductDto productFromJson)
        {
            if (productFromJson == null)
                throw new ArgumentNullException(nameof(productFromJson));

            if (string.IsNullOrEmpty(productFromJson.Name))
                throw new ArgumentNullException(nameof(productFromJson.Name));

            var existingProductsDictionary = _importDataProvider.ExistingProducts;
            Product importedProduct;

            if (existingProductsDictionary.TryGetValue(productFromJson.Name, out var existingProduct))
            {
                importedProduct = existingProduct;
            }
            else
            {
                importedProduct = new Product { Name = productFromJson.Name };
                existingProductsDictionary.Add(productFromJson.Name, importedProduct);
            }

            importedProduct.CaloriesCost = productFromJson.CaloriesCost;
            importedProduct.DefaultQuantity = productFromJson.DefaultQuantity;
            importedProduct.Category = _categoryImporter.ImportCategory(productFromJson.Category);
            return importedProduct;
        }
    }
}
