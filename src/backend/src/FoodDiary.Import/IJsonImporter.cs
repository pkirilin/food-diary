using System;
using System.Collections.Generic;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import;

/// <summary>
/// Main JSON import runner
/// </summary>
public interface IJsonImporter
{
    /// <summary>
    /// Runs import for valid pages JSON object
    /// </summary>
    /// <param name="jsonObj">Valid pages JSON object</param>
    /// <param name="createdPages">Pages that has been created during import</param>
    /// <exception cref="ArgumentNullException"></exception>
    void Import(JsonExportFileDto jsonObj, out List<Page> createdPages);
}