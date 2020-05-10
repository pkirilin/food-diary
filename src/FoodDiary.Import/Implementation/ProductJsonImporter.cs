using System;
using FoodDiary.Domain.Dtos;
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

        public Product ImportProduct(ProductJsonItemDto productFromJson)
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
                importedProduct = new Product()
                {
                    Name = productFromJson.Name
                };
            }

            importedProduct.Category = _categoryImporter.ImportCategory(productFromJson.Category);
            return importedProduct;
        }
    }
}
