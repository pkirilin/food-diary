using FoodDiary.Domain.Entities;

namespace FoodDiary.Import.Services
{
    interface ICategoryJsonImporter
    {
        Category ImportCategory(string categoryNameFromJson);
    }
}
