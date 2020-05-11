using System;
using System.Collections.Generic;
using System.Linq;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Exceptions;

namespace FoodDiary.Import.Core
{
    class JsonParser : IJsonParser
    {
        public IEnumerable<PageJsonItemDto> ParsePages(PagesJsonObjectDto jsonObj)
        {
            if (jsonObj == null)
                throw new ArgumentNullException(nameof(jsonObj));

            var jsonPagesGroupedByDates = jsonObj.Pages.GroupBy(p => p.Date);
            var arePageDatesUnique = jsonPagesGroupedByDates.Select(g => g.Count())
                .All(groupSize => groupSize == 1);

            if (!arePageDatesUnique)
                throw new ImportException("Failed to import pages: file contains duplicate page dates");

            return jsonPagesGroupedByDates.Select(g => g.First());
        }

        public IEnumerable<NoteJsonItemDto> ParseNotes(IEnumerable<PageJsonItemDto> pagesFromJson)
        {
            var notesForEachPage = pagesFromJson.Select(p => p.Notes);

            var areDisplayOrdersAndMealTypesUniqueForEveryPage = notesForEachPage
                .All(pn => pn.GroupBy(n => new { n.MealType, n.DisplayOrder })
                    .Select(g => g.Count())
                    .All(count => count == 1));

            if (!areDisplayOrdersAndMealTypesUniqueForEveryPage)
                throw new ImportException("Failed to import pages: file contains duplicate meal types and display orders for page(s)");

            return notesForEachPage.SelectMany(pn => pn);
        }

        public IEnumerable<string> ParseProductNames(IEnumerable<NoteJsonItemDto> notesFromJson)
        {
            return notesFromJson.Select(n => n.Product.Name)
                .Distinct();
        }

        public IEnumerable<string> ParseCategoryNames(IEnumerable<NoteJsonItemDto> notesFromJson)
        {
            return notesFromJson.Select(n => n.Product.Category)
                .Distinct();
        }
    }
}
