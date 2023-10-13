using System.Collections.Generic;
using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Pages.Requests
{
    public class GetPagesByIdsRequest : GetEntitiesByIdsRequest<Page>
    {
        public GetPagesByIdsRequest(IEnumerable<int> ids) : base(ids)
        {
        }
    }
}
