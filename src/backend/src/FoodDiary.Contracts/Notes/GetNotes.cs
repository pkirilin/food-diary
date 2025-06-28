using System.ComponentModel.DataAnnotations;
using FoodDiary.Domain.Enums;
using JetBrains.Annotations;

namespace FoodDiary.Contracts.Notes;

[PublicAPI]
public class GetNotesRequest
{
    [Required]
    public DateOnly? Date { get; init; }
}

[PublicAPI]
public record GetNotesResponse(IReadOnlyCollection<GetNotesResponse.Note> Notes)
{
    public record Note(
        int Id,
        DateOnly Date,
        MealType MealType,
        int ProductQuantity,
        int DisplayOrder,
        Product Product);

    public record Product(
        int Id,
        string Name,
        int DefaultQuantity,
        int Calories,
        decimal? Protein,
        decimal? Fats,
        decimal? Carbs,
        decimal? Sugar,
        decimal? Salt);
}