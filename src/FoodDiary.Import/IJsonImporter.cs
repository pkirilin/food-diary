using System.Collections.Generic;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import
{
    public interface IJsonImporter
    {
        void Import(PagesJsonExportDto jsonObj, out List<Page> createdPages);
    }
}
