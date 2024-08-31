using FoodDiary.API.Dtos;
using FoodDiary.Application.Notes.Create;
using FoodDiary.Application.Notes.Update;
using FoodDiary.Contracts.Notes;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Mapping;

public static class NotesMapper
{
    public static NoteItemDto ToNoteItemDto(this Note note) => new()
    {
        Id = note.Id,
        Date = note.Date,
        MealType = note.MealType,
        DisplayOrder = note.DisplayOrder,
        ProductId = note.ProductId,
        ProductName = note.Product.Name,
        ProductQuantity = note.ProductQuantity,
        ProductDefaultQuantity = note.Product.DefaultQuantity,
    };

    public static CreateNoteCommand ToCreateNoteCommand(this NoteRequestBody body) => new(
        body.Date.GetValueOrDefault(),
        body.MealType,
        body.ProductId,
        body.ProductQuantity,
        body.DisplayOrder
    );
    
    public static UpdateNoteCommand ToUpdateNoteCommand(this NoteRequestBody body, int id) => new(
        id,
        body.Date.GetValueOrDefault(),
        body.MealType,
        body.ProductId,
        body.ProductQuantity,
        body.DisplayOrder
    );
}