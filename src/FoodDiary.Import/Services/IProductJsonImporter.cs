using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import.Services
{
    interface IProductJsonImporter
    {
        Product ImportProduct(ProductJsonItemDto productFromJson);
    }
}
