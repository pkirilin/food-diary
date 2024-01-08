using System;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Services;

namespace FoodDiary.Import.Implementation;

class CategoryJsonImporter : ICategoryJsonImporter
{
    private readonly IJsonImportDataProvider _importDataProvider;

    public CategoryJsonImporter(IJsonImportDataProvider importDataProvider)
    {
        _importDataProvider = importDataProvider ?? throw new ArgumentNullException(nameof(importDataProvider));
    }

    public Category ImportCategory(string categoryNameFromJson)
    {
        if (String.IsNullOrWhiteSpace(categoryNameFromJson))
            throw new ArgumentNullException(nameof(categoryNameFromJson));

        var existingCategoriesDictionary = _importDataProvider.ExistingCategories;
        Category importedCategory;

        if (existingCategoriesDictionary.ContainsKey(categoryNameFromJson))
            importedCategory = existingCategoriesDictionary[categoryNameFromJson];
        else
        {
            importedCategory = new Category { Name = categoryNameFromJson };
            existingCategoriesDictionary.Add(categoryNameFromJson, importedCategory);
        }

        return importedCategory;
    }
}