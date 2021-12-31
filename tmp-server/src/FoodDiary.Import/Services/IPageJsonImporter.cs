using System.Runtime.CompilerServices;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Models;

[assembly: InternalsVisibleTo("DynamicProxyGenAssembly2")]

namespace FoodDiary.Import.Services
{
    interface IPageJsonImporter
    {
        /// <summary>
        /// Creates or updates page from JSON
        /// </summary>
        /// <param name="pageFromJson"></param>
        /// <param name="createdPage">Imported page entity</param>
        void ImportPage(PageJsonItem pageFromJson, out Page createdPage);
    }
}
