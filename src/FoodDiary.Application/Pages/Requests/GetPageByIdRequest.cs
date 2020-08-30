using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Pages.Requests
{
    public class GetPageByIdRequest : GetEntityByIdRequest<Page>
    {
        public GetPageByIdRequest(int id) : base(id)
        {
        }
    }
}
