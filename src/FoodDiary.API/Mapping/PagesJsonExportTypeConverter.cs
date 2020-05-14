using System.Collections.Generic;
using AutoMapper;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Models;

namespace FoodDiary.API.Mapping
{
    public class PagesJsonExportTypeConverter : ITypeConverter<IEnumerable<Page>, PagesJsonObject>
    {
        public PagesJsonObject Convert(IEnumerable<Page> source, PagesJsonObject destination, ResolutionContext context)
        {
            return new PagesJsonObject
            {
                Pages = context.Mapper.Map<IEnumerable<PageJsonItem>>(source)
            };
        }
    }
}
