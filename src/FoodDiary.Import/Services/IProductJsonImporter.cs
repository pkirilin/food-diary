using FoodDiary.Domain.Entities;
using FoodDiary.Import.Models;

namespace FoodDiary.Import.Services
{
    interface IProductJsonImporter
    {
        Product ImportProduct(ProductJsonItem productFromJson);
    }
}
