using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import.Services;

interface INoteJsonImporter
{
    /// <summary>
    /// Creates note from JSON
    /// </summary>
    /// <returns>Imported note entity</returns>
    Note ImportNote(JsonExportNoteDto noteFromJson);
}