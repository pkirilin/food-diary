using JetBrains.Annotations;

namespace FoodDiary.Contracts.Products;

[PublicAPI]
public class SuggestProductNutritionRequest
{
    public required string Name { get; init; }
}
