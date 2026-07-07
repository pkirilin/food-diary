using System.ComponentModel;

namespace FoodDiary.Application.Products.SuggestNutrition;

public record SuggestedNutrition(
    [property: Description("Calories in kilocalories per 100 g. Never joules. Numeric only. Null only if you truly cannot estimate it.")]
    decimal? Calories = null,
    [property: Description("Protein in grams per 100 g.")]
    decimal? Protein = null,
    [property: Description("Fats in grams per 100 g.")]
    decimal? Fats = null,
    [property: Description("Carbohydrates in grams per 100 g.")]
    decimal? Carbs = null,
    [property: Description("Sugar in grams per 100 g.")]
    decimal? Sugar = null,
    [property: Description("Salt in grams per 100 g.")]
    decimal? Salt = null);
