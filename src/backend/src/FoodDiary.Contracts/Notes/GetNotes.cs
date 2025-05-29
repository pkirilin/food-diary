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
        [property: Obsolete($"Use {nameof(Product.Id)} instead")]
        int ProductId,
        int ProductQuantity,
        [property: Obsolete($"Use {nameof(Product.DefaultQuantity)} instead")]
        int ProductDefaultQuantity,
        int DisplayOrder,
        [property: Obsolete($"Use {nameof(Product.Name)} instead")]
        string ProductName,
        [property: Obsolete($"Use {nameof(Product.Calories)} instead and calculate on client")]
        int Calories,
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