using FoodDiary.Contracts.Export.Json;
using MediatR;

namespace FoodDiary.Application.Imports.Requests
{
    public class PagesJsonImportRequest : IRequest<int>
    {
        public JsonExportFileDto JsonObj { get; set; }

        public PagesJsonImportRequest(JsonExportFileDto jsonObj)
        {
            JsonObj = jsonObj;
        }
    }
}
