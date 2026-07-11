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

public static class SuggestNutritionMappingExtensions
{
    public static RecognizeNoteItem ToRecognizeNoteItem(this RecognizedProduct product)
    {
        return new RecognizeNoteItem(
            Product: new RecognizeProductItem(
                Name: string.IsNullOrWhiteSpace(product.BrandName)
                    ? product.Name
                    : $"{product.Name} ({product.BrandName})",
                CaloriesCost: product.Calories.HasValue
                    ? (int)Math.Round(product.Calories.Value, MidpointRounding.AwayFromZero)
                    : 100,
                Protein: product.Protein.ToRoundedNutritionQuantity(),
                Fats: product.Fats.ToRoundedNutritionQuantity(),
                Carbs: product.Carbs.ToRoundedNutritionQuantity(),
                Sugar: product.Sugar.ToRoundedNutritionQuantity(),
                Salt: product.Salt.ToRoundedNutritionQuantity()),
            Quantity: product.Quantity ?? 100);
    }

    private static decimal? ToRoundedNutritionQuantity(this decimal? value) =>
        value.HasValue ? Math.Round(value.GetValueOrDefault(), 2) : null;
}