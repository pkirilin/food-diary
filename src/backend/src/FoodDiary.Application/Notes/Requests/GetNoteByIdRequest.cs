using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Notes.Requests;

public class GetNoteByIdRequest : GetEntityByIdRequest<Note>
{
    public GetNoteByIdRequest(int id) : base(id)
    {
    }
}