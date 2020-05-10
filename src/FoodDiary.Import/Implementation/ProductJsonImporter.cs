using System;
using System.Collections.Generic;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Services;

namespace FoodDiary.Import.Implementation
{
    class ProductJsonImporter : IProductJsonImporter
    {
        private readonly IDictionary<string, Product> _existingProductsDictionary;

        private readonly ICategoryJsonImporter _categoryImporter;

        public ProductJsonImporter(IJsonImportDataProvider importDataProvider, ICategoryJsonImporter categoryImporter)
        {
            _existingProductsDictionary = importDataProvider?.ExistingProducts ?? throw new ArgumentNullException(nameof(importDataProvider), "Could not get existing products dictionary");
            _categoryImporter = categoryImporter ?? throw new ArgumentNullException(nameof(categoryImporter));
        }

        public Product ImportProduct(ProductJsonItemDto productFromJson)
        {
            if (productFromJson == null)
                throw new ArgumentNullException(nameof(productFromJson));

            if (String.IsNullOrEmpty(productFromJson.Name))
                throw new ArgumentNullException(nameof(productFromJson.Name));

            Product importedProduct;

            if (_existingProductsDictionary.ContainsKey(productFromJson.Name))
                importedProduct = _existingProductsDictionary[productFromJson.Name];
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
