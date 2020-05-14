using System.Runtime.CompilerServices;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Models;

[assembly: InternalsVisibleTo("DynamicProxyGenAssembly2")]

namespace FoodDiary.Import.Services
{
    interface IPageJsonImporter
    {
        void ImportPage(PageJsonItem pageFromJson, out Page createdPage);
    }
}
