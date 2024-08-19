using FoodDiary.API.Dtos;
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
        PageId = note.PageId,
        MealType = note.MealType,
        DisplayOrder = note.DisplayOrder,
        ProductId = note.ProductId,
        ProductName = note.Product.Name,
        ProductQuantity = note.ProductQuantity,
        ProductDefaultQuantity = note.Product.DefaultQuantity,
    };
    
    public static UpdateNoteCommand ToUpdateNoteCommand(this UpdateNoteRequestBody body, int id) => new(
        id,
        body.Date.GetValueOrDefault(),
        body.MealType,
        body.ProductId,
        body.PageId,
        body.ProductQuantity,
        body.DisplayOrder
    );
}