using JetBrains.Annotations;

namespace FoodDiary.API.Features.Products.Contracts;

[PublicAPI]
public class SuggestNutritionRequestBody
{
    public required string Name { get; init; }
}
