using System;
using System.Collections.Generic;
using System.Linq;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Services;

namespace FoodDiary.Import.Implementation
{
    class PageJsonImporter : IPageJsonImporter
    {
        private readonly IDictionary<DateTime, Page> _existingPagesDictionary;

        private readonly INoteJsonImporter _noteImporter;

        public PageJsonImporter(IJsonImportDataProvider importData, INoteJsonImporter noteImporter)
        {
            _existingPagesDictionary = importData?.ExistingPages ?? throw new ArgumentNullException(nameof(importData), "Could not get existing pages dictionary");
            _noteImporter = noteImporter ?? throw new ArgumentNullException(nameof(noteImporter));
        }

        public void ImportPage(PageJsonItemDto pageFromJson, out Page createdPage)
        {
            // argument checks

            Page importedPage;
            createdPage = null;

            if (_existingPagesDictionary.ContainsKey(pageFromJson.Date))
                importedPage = _existingPagesDictionary[pageFromJson.Date];
            else
            {
                importedPage = createdPage = new Page()
                {
                    Date = pageFromJson.Date
                };
            }

            importedPage.Notes = pageFromJson.Notes
                .Select(n => _noteImporter.ImportNote(n))
                .ToList();
        }
    }
}
