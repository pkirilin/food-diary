using System.Collections.Generic;
using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Notes.Requests
{
    public class GetNotesByIdsRequest : GetEntitiesByIdsRequest<Note>
    {
        public GetNotesByIdsRequest(IEnumerable<int> ids) : base(ids)
        {
        }
    }
}
