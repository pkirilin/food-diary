using System.Collections.Generic;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Helpers
{
    public class PagesJsonExportTypeConverter : ITypeConverter<IEnumerable<Page>, PagesJsonExportDto>
    {
        public PagesJsonExportDto Convert(IEnumerable<Page> source, PagesJsonExportDto destination, ResolutionContext context)
        {
            return new PagesJsonExportDto
            {
                Pages = context.Mapper.Map<IEnumerable<PageJsonItemDto>>(source)
            };
        }
    }
}
