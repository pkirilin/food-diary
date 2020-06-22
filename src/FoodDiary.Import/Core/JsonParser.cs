﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Exceptions;
using FoodDiary.Import.Models;

[assembly: InternalsVisibleTo("FoodDiary.Import.UnitTests")]

namespace FoodDiary.Import.Core
{
    class JsonParser : IJsonParser
    {
        public IEnumerable<PageJsonItem> ParsePages(PagesJsonObject jsonObj)
        {
            if (jsonObj == null)
                throw new ArgumentNullException(nameof(jsonObj));

            if (jsonObj.Pages == null)
                throw new ImportException("Failed to parse pages from import file");

            var jsonPagesGroupedByDates = jsonObj.Pages.GroupBy(p => p.Date);
            var arePageDatesUnique = jsonPagesGroupedByDates.Select(g => g.Count())
                .All(groupSize => groupSize == 1);

            if (!arePageDatesUnique)
                throw new ImportException("Failed to parse pages from import file");

            return jsonPagesGroupedByDates.Select(g => g.First());
        }

        public IEnumerable<NoteJsonItem> ParseNotes(IEnumerable<PageJsonItem> pagesFromJson)
        {
            var notesForEachPage = pagesFromJson.Select(p => p.Notes);

            if (notesForEachPage.Any(pn => pn == null))
                throw new ImportException("Failed to parse notes from import file");

            var notesFromJson = notesForEachPage.SelectMany(pn => pn);

            var areDisplayOrdersAndMealTypesUniqueForEveryPage = notesForEachPage
                .All(pn => pn.GroupBy(n => new { n.MealType, n.DisplayOrder })
                    .Select(g => g.Count())
                    .All(count => count == 1));

            var areDisplayOrdersValid = notesForEachPage
                .All(pn => pn.GroupBy(n => n.MealType)
                    .Select(g => g.All(n => n.DisplayOrder >= 0 && n.DisplayOrder < g.Count()))
                    .All(isValid => isValid));

            var areMealTypesValid = notesFromJson.Select(n => n.MealType).Distinct()
                .All(mt => Enum.IsDefined(typeof(MealType), mt));

            var areProductQuantitiesValid = notesFromJson.All(n => n.ProductQuantity >= 10 && n.ProductQuantity <= 1000);

            if (!areDisplayOrdersAndMealTypesUniqueForEveryPage 
                || !areDisplayOrdersValid 
                || !areMealTypesValid
                || !areProductQuantitiesValid)
                throw new ImportException("Failed to parse notes from import file");

            return notesFromJson;
        }

        public IEnumerable<string> ParseProducts(IEnumerable<NoteJsonItem> notesFromJson)
        {
            var productsFromJson = notesFromJson.Select(n => n.Product);

            var areProductsFromJsonValid = productsFromJson.All(p => p != null
                && p.Name.Length >= 3 && p.Name.Length <= 64
                && p.CaloriesCost >= 1 && p.CaloriesCost <= 1000);

            if (!areProductsFromJsonValid)
                throw new ImportException("Failed to parse products from import file");

            return productsFromJson.Select(p => p.Name).Distinct();
        }

        public IEnumerable<string> ParseCategories(IEnumerable<NoteJsonItem> notesFromJson)
        {
            var categoryNamesFromJson = notesFromJson.Select(n => n.Product.Category);

            var areCategoryNamesFromJsonValid = categoryNamesFromJson.All(name => name != null
                && name.Length >= 4 && name.Length <= 64);

            if (!areCategoryNamesFromJsonValid)
                throw new ImportException("Failed to parse categories from import file");

            return categoryNamesFromJson.Distinct();
        }
    }
}
