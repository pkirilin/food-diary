using FoodDiary.Domain.Entities;
using FoodDiary.Import.Models;

namespace FoodDiary.Import.Services
{
    interface IProductJsonImporter
    {
        /// <summary>
        /// Creates or updates product from JSON
        /// </summary>
        /// <returns>Imported product entity</returns>
        Product ImportProduct(ProductJsonItem productFromJson);
    }
}
