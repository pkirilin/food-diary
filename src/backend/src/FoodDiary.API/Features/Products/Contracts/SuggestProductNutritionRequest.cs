using JetBrains.Annotations;

namespace FoodDiary.API.Features.Products.Contracts;

[PublicAPI]
public class SuggestProductNutritionRequest
{
    public required string Name { get; init; }
}
