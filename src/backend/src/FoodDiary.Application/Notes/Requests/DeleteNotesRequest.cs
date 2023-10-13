using System.Collections.Generic;
using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Notes.Requests
{
    public class DeleteNotesRequest : DeleteManyEntitiesRequest<Note>
    {
        public DeleteNotesRequest(IEnumerable<Note> entities) : base(entities)
        {
        }
    }
}
