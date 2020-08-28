using FoodDiary.Import.Models;
using MediatR;

namespace FoodDiary.Application.Imports.Requests
{
    public class PagesJsonImportRequest : IRequest<int>
    {
        public PagesJsonObject JsonObj { get; set; }

        public PagesJsonImportRequest(PagesJsonObject jsonObj)
        {
            JsonObj = jsonObj;
        }
    }
}
