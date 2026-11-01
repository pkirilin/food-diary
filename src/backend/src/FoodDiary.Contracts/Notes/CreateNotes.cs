using System.ComponentModel.DataAnnotations;
using FoodDiary.Domain.Enums;
using JetBrains.Annotations;

namespace FoodDiary.Contracts.Notes;

[PublicAPI]
public class CreateNotesRequest
{
    [Required]
    public required DateOnly? Date { get; init; }

    [EnumDataType(typeof(MealType))]
    public required MealType MealType { get; init; }

    [Required]
    [MinLength(1)]
    public required IReadOnlyList<Note> Notes { get; init; }

    [PublicAPI]
    public class Note
    {
        [Range(1, int.MaxValue)]
        public required int ProductId { get; init; }

        [Range(10, 1000, ErrorMessage = "Quantity value must be between 10 and 1000 cal")]
        public required int ProductQuantity { get; init; }
    }
}
