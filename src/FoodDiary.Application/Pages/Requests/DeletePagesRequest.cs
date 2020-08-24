using System.Collections.Generic;
using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Pages.Requests
{
    public class DeletePagesRequest : DeleteManyEntitiesRequest<Page>
    {
        public DeletePagesRequest(IEnumerable<Page> entities) : base(entities)
        {
        }
    }
}
