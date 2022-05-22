using System.Collections.Generic;
using AutoMapper;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Mapping
{
    public class PagesJsonExportTypeConverter : ITypeConverter<IEnumerable<Page>, JsonExportFileDto>
    {
        public JsonExportFileDto Convert(IEnumerable<Page> source, JsonExportFileDto destination, ResolutionContext context)
        {
            return new JsonExportFileDto
            {
                Pages = context.Mapper.Map<IEnumerable<JsonExportPageDto>>(source)
            };
        }
    }
}
