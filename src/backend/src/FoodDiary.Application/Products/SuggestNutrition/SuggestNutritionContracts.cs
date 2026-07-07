using System;
using JetBrains.Annotations;

namespace FoodDiary.Application.Products.SuggestNutrition;

[PublicAPI]
public record SuggestNutritionResponse(
    int? Calories,
    decimal? Protein,
    decimal? Fats,
    decimal? Carbs,
    decimal? Sugar,
    decimal? Salt);

public static class MappingExtensions
{
    private const int MinCalories = 1;
    private const int MaxCalories = 1000;
    private const decimal MinNutrient = 0;
    private const decimal MaxNutrient = 1000;

    public static SuggestNutritionResponse ToSuggestNutritionResponse(this SuggestedNutrition nutrition) =>
        new(
            Calories: ToCalories(nutrition.Calories),
            Protein: ToNutrient(nutrition.Protein),
            Fats: ToNutrient(nutrition.Fats),
            Carbs: ToNutrient(nutrition.Carbs),
            Sugar: ToNutrient(nutrition.Sugar),
            Salt: ToNutrient(nutrition.Salt));

    private static int? ToCalories(decimal? value)
    {
        if (!value.HasValue)
        {
            return null;
        }

        var rounded = (int)Math.Round(value.Value, MidpointRounding.AwayFromZero);
        return Math.Clamp(rounded, MinCalories, MaxCalories);
    }

    private static decimal? ToNutrient(decimal? value)
    {
        if (!value.HasValue)
        {
            return null;
        }

        var rounded = Math.Round(value.Value, 2);
        return Math.Clamp(rounded, MinNutrient, MaxNutrient);
    }
}
