using System.Collections.Generic;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Helpers
{
    public class PagesJsonExportTypeConverter : ITypeConverter<IEnumerable<Page>, PagesJsonObjectDto>
    {
        public PagesJsonObjectDto Convert(IEnumerable<Page> source, PagesJsonObjectDto destination, ResolutionContext context)
        {
            return new PagesJsonObjectDto
            {
                Pages = context.Mapper.Map<IEnumerable<PageJsonItemDto>>(source)
            };
        }
    }
}
