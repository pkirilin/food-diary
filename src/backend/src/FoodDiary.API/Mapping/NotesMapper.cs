using System.Linq;
using FoodDiary.Application.Notes.Create;
using FoodDiary.Application.Notes.Get;
using FoodDiary.Application.Notes.GetHistory;
using FoodDiary.Application.Notes.Update;
using FoodDiary.Contracts.Notes;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

namespace FoodDiary.API.Mapping;

public static class NotesMapper
{
    public static GetNotesResponse.Note ToGetNotesResponse(this Note note) => new(
        Id: note.Id,
        Date: note.Date,
        MealType: note.MealType,
        DisplayOrder: note.DisplayOrder,
        ProductQuantity: note.ProductQuantity,
        Product: note.Product.ToGetNotesResponse());

    private static GetNotesResponse.Product ToGetNotesResponse(this Product product) => new(
        Id: product.Id,
        Name: product.Name,
        DefaultQuantity: product.DefaultQuantity,
        Calories: product.CaloriesCost,
        Protein: product.Protein,
        Fats: product.Fats,
        Carbs: product.Carbs,
        Sugar: product.Sugar,
        Salt: product.Salt);

    public static GetNotesQuery ToGetNotesQuery(this GetNotesRequest request) => new(
        request.Date.GetValueOrDefault()
    );

    public static GetNotesHistoryQuery ToGetNotesHistoryQuery(this GetNotesHistoryRequest request) => new(
        request.From.GetValueOrDefault(),
        request.To.GetValueOrDefault()
    );

    public static GetNotesResponse ToGetNotesResponse(this GetNotesQueryResult result) => new(
        Notes: result.Notes
            .Select(n => n.ToGetNotesResponse())
            .ToList());

    public static GetNotesHistoryResponse ToGetNotesHistoryResponse(
        this GetNotesHistoryQueryResult result,
        ICaloriesCalculator calculator) => new(
        result.Notes
            .GroupBy(n => n.Date)
            .Select(g => new NotesHistoryItem(
                Date: g.Key,
                CaloriesCount: calculator.Calculate(g.ToArray())))
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