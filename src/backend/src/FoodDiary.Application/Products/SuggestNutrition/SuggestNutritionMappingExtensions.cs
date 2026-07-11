using System;
using FoodDiary.Contracts.Products;

namespace FoodDiary.Application.Products.SuggestNutrition;

public static class SuggestNutritionMappingExtensions
{
    private const int MinCalories = 1;
    private const int MaxCalories = 1000;
    private const decimal MinNutrient = 0;
    private const decimal MaxNutrient = 1000;

    public static SuggestProductNutritionResponse ToSuggestProductNutritionResponse(this SuggestedNutrition nutrition) =>
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
