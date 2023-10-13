using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Services;

[assembly: InternalsVisibleTo("FoodDiary.Import.UnitTests")]

namespace FoodDiary.Import.Core
{
    class JsonImporter : IJsonImporter
    {
        private readonly IPageJsonImporter _pageImporter;

        public JsonImporter(IPageJsonImporter pageImporter)
        {
            _pageImporter = pageImporter ?? throw new ArgumentNullException(nameof(pageImporter));
        }

        public void Import(JsonExportFileDto jsonObj, out List<Page> createdPages)
        {
            if (jsonObj == null)
                throw new ArgumentNullException(nameof(jsonObj));

            createdPages = new List<Page>();

            foreach (var pageFromJson in jsonObj.Pages)
            {
                _pageImporter.ImportPage(pageFromJson, out var createdPage);
                
                if (createdPage != null)
                    createdPages.Add(createdPage);
            }
        }
    }
}
