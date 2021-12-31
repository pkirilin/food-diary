using System;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Models;
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

        public Product ImportProduct(ProductJsonItem productFromJson)
        {
            if (productFromJson == null)
                throw new ArgumentNullException(nameof(productFromJson));

            if (String.IsNullOrEmpty(productFromJson.Name))
                throw new ArgumentNullException(nameof(productFromJson.Name));

            var existingProductsDictionary = _importDataProvider.ExistingProducts;
            Product importedProduct;

            if (existingProductsDictionary.ContainsKey(productFromJson.Name))
                importedProduct = existingProductsDictionary[productFromJson.Name];
            else
            {
                importedProduct = new Product { Name = productFromJson.Name };
                existingProductsDictionary.Add(productFromJson.Name, importedProduct);
            }

            importedProduct.CaloriesCost = productFromJson.CaloriesCost;
            importedProduct.Category = _categoryImporter.ImportCategory(productFromJson.Category);
            return importedProduct;
        }
    }
}
