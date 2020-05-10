using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import.Services
{
    interface IPageJsonImporter
    {
        void ImportPage(PageJsonItemDto pageFromJson, out Page createdPage);
    }
}
