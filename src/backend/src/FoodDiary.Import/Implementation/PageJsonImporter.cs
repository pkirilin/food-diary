using System;
using System.Linq;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Services;

namespace FoodDiary.Import.Implementation;

internal class PageJsonImporter : IPageJsonImporter
{
    private readonly IJsonImportDataProvider _importDataProvider;

    private readonly INoteJsonImporter _noteImporter;

    public PageJsonImporter(IJsonImportDataProvider importDataProvider, INoteJsonImporter noteImporter)
    {
        _importDataProvider = importDataProvider ?? throw new ArgumentNullException(nameof(importDataProvider));
        _noteImporter = noteImporter ?? throw new ArgumentNullException(nameof(noteImporter));
    }

    public void ImportPage(JsonExportPageDto pageFromJson, out Page createdPage)
    {
        if (pageFromJson == null)
            throw new ArgumentNullException(nameof(pageFromJson));

        if (pageFromJson.Notes == null)
            throw new ArgumentNullException(nameof(pageFromJson.Notes));

        var existingPagesDictionary = _importDataProvider.ExistingPages;
        Page importedPage;
        createdPage = null;

        if (existingPagesDictionary.TryGetValue(pageFromJson.Date, out var page))
            importedPage = page;
        else
        {
            importedPage = createdPage = new Page
            {
                Date = pageFromJson.Date
            };
        }

        importedPage.Notes = pageFromJson.Notes
            .Select(n => _noteImporter.ImportNote(n))
            .ToList();
    }
}