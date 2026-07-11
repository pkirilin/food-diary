using System.ComponentModel.DataAnnotations;
using JetBrains.Annotations;

namespace FoodDiary.Contracts.Products;

[PublicAPI]
public class SuggestProductNutritionRequest
{
    [Required]
    public required string Name { get; init; }
}
