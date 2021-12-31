using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Notes.Requests
{
    public class CreateNoteRequest : CreateEntityRequest<Note>
    {
        public CreateNoteRequest(Note entity) : base(entity)
        {
        }
    }
}
