using JetBrains.Annotations;

namespace FoodDiary.Contracts.Products;

[PublicAPI]
public record SuggestProductNutritionResponse(
    int? Calories,
    decimal? Protein,
    decimal? Fats,
    decimal? Carbs,
    decimal? Sugar,
    decimal? Salt);