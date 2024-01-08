using FoodDiary.Domain.Entities;

namespace FoodDiary.Import.Services;

interface ICategoryJsonImporter
{
    /// <summary>
    /// Creates or updates category from JSON
    /// </summary>
    /// <returns>Imported category entity</returns>
    Category ImportCategory(string categoryNameFromJson);
}