using System;
using System.Collections.Generic;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Services;

namespace FoodDiary.Import.Implementation
{
    class CategoryJsonImporter : ICategoryJsonImporter
    {
        private readonly IDictionary<string, Category> _existingCategoriesDictionary;

        public CategoryJsonImporter(IJsonImportDataProvider importDataProvider)
        {
            _existingCategoriesDictionary = importDataProvider?.ExistingCategories ?? throw new ArgumentNullException(nameof(importDataProvider), "Could not get existing categories dictionary");
        }

        public Category ImportCategory(string categoryNameFromJson)
        {
            if (String.IsNullOrWhiteSpace(categoryNameFromJson))
                throw new ArgumentNullException(nameof(categoryNameFromJson));

            Category importedCategory;

            if (_existingCategoriesDictionary.ContainsKey(categoryNameFromJson))
                importedCategory = _existingCategoriesDictionary[categoryNameFromJson];
            else
            {
                importedCategory = new Category()
                {
                    Name = categoryNameFromJson
                };
            }

            return importedCategory;
        }
    }
}
