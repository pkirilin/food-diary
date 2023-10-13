using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import.Services
{
    interface IProductJsonImporter
    {
        /// <summary>
        /// Creates or updates product from JSON
        /// </summary>
        /// <returns>Imported product entity</returns>
        Product ImportProduct(JsonExportProductDto productFromJson);
    }
}
