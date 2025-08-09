using System;
using System.Collections.Generic;
using JetBrains.Annotations;

namespace FoodDiary.Application.Notes.Recognize;

[PublicAPI]
public record RecognizeNoteResponse(IReadOnlyList<RecognizeNoteItem> Notes);

[PublicAPI]
public record RecognizeNoteItem(RecognizeProductItem Product, int Quantity);

[PublicAPI]
public record RecognizeProductItem(
    string Name,
    int CaloriesCost,
    decimal? Protein,
    decimal? Fats,
    decimal? Carbs,
    decimal? Sugar,
    decimal? Salt);

public static class MappingExtensions
{
    public static RecognizeNoteItem ToRecognizeNoteItem(this FoodItemOnTheImage food)
    {
        return new RecognizeNoteItem(
            Product: new RecognizeProductItem(
                Name: string.IsNullOrWhiteSpace(food.BrandName) ? food.Name : $"{food.Name} ({food.BrandName})",
                CaloriesCost: food.Calories ?? 100,
                Protein: food.Protein.ToRoundedNutritionQuantity(),
                Fats: food.Fats.ToRoundedNutritionQuantity(),
                Carbs: food.Carbs.ToRoundedNutritionQuantity(),
                Sugar: food.Sugar.ToRoundedNutritionQuantity(),
                Salt: food.Salt.ToRoundedNutritionQuantity()),
            Quantity: food.Quantity ?? 100);
    }

    private static decimal? ToRoundedNutritionQuantity(this decimal? value) =>
        value.HasValue ? Math.Round(value.GetValueOrDefault(), 2) : null;
}