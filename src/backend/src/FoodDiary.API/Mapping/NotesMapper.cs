using FoodDiary.API.Dtos;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Mapping;

public static class NotesMapper
{
    public static NoteItemDto ToNoteItemDto(this Note note) => new()
    {
        Id = note.Id,
        PageId = note.PageId,
        MealType = note.MealType,
        DisplayOrder = note.DisplayOrder,
        ProductId = note.ProductId,
        ProductName = note.Product.Name,
        ProductQuantity = note.ProductQuantity,
        ProductDefaultQuantity = note.Product.DefaultQuantity,
    };

    public static NoteCreateEditRequest ToNoteCreateEditRequest(this Note note) => new()
    {
        MealType = note.MealType,
        ProductQuantity = note.ProductQuantity,
        DisplayOrder = note.DisplayOrder,
        ProductId = note.ProductId,
        PageId = note.PageId
    };
}