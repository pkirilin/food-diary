using System.Runtime.CompilerServices;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;

[assembly: InternalsVisibleTo("DynamicProxyGenAssembly2")]

namespace FoodDiary.Import.Services;

interface IPageJsonImporter
{
    /// <summary>
    /// Creates or updates page from JSON
    /// </summary>
    /// <param name="pageFromJson"></param>
    /// <param name="createdPage">Imported page entity</param>
    void ImportPage(JsonExportPageDto pageFromJson, out Page createdPage);
}