using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Notes.Requests
{
    public class DeleteNoteRequest : DeleteEntityRequest<Note>
    {
        public DeleteNoteRequest(Note entity) : base(entity)
        {
        }
    }
}
