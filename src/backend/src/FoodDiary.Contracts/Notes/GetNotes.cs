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
public record GetNotesResponse(IReadOnlyCollection<NoteItem> Notes);

[PublicAPI]
public record NoteItem(
    int Id,
    DateOnly Date,
    MealType MealType,
    int ProductId,
    int ProductQuantity,
    int ProductDefaultQuantity,
    int DisplayOrder,
    string ProductName,
    int Calories);