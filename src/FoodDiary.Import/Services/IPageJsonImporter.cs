using System.Runtime.CompilerServices;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

[assembly: InternalsVisibleTo("DynamicProxyGenAssembly2")]

namespace FoodDiary.Import.Services
{
    interface IPageJsonImporter
    {
        void ImportPage(PageJsonItemDto pageFromJson, out Page createdPage);
    }
}
