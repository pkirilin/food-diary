using System.Collections.Generic;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Models;

namespace FoodDiary.Import
{
    public interface IJsonImporter
    {
        void Import(PagesJsonObject jsonObj, out List<Page> createdPages);
    }
}
