using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Notes.Requests;

public class EditNoteRequest : EditEntityRequest<Note>
{
    public EditNoteRequest(Note entity) : base(entity)
    {
    }
}