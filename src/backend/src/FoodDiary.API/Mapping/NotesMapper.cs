using System.Linq;
using FoodDiary.API.Dtos;
using FoodDiary.Application.Notes.Create;
using FoodDiary.Application.Notes.GetByDate;
using FoodDiary.Application.Notes.Update;
using FoodDiary.Contracts.Notes;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

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
    
    public static NoteItem ToNoteItem(this Note note, ICaloriesCalculator calculator) => new(
        Id: note.Id,
        Date: note.Date.GetValueOrDefault(),
        MealType: note.MealType,
        DisplayOrder: note.DisplayOrder,
        ProductId: note.ProductId,
        ProductName: note.Product.Name,
        ProductQuantity: note.ProductQuantity,
        ProductDefaultQuantity: note.Product.DefaultQuantity,
        Calories: calculator.Calculate(note));

    public static GetNotesByDateQuery ToGetNotesByDateQuery(this GetNotesByDateRequest request) => new(
        request.Date.GetValueOrDefault()
    );

    public static GetNotesByDateResponse ToGetNotesByDateResponse(
        this GetNotesByDateQueryResult result,
        ICaloriesCalculator calculator) => new(
        result.Notes
            .Select(n => n.ToNoteItem(calculator))
            .ToList()
    );

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