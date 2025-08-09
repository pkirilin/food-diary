using System.ComponentModel;

namespace FoodDiary.Application.Notes.Recognize;

public record FoodItemOnTheImage(
    [property: Description("Product name, e.g. Bread. Always start with a uppercase letter, avoid CAPS")]
    string Name,
    [property: Description("Product quantity in grams, e.g. 50")]
    int? Quantity = null,
    [property: Description("Product calories in kilocalories per 100 grams of quantity, e.g. 125")]
    int? Calories = null,
    [property: Description("Product brand name, e.g. Nestle")]
    string? BrandName = null,
    [property: Description("Product protein in grams per 100 grams of quantity, e.g. 1.23")]
    decimal? Protein = null,
    [property: Description("Product fats in grams per 100 grams of quantity, e.g. 10.45")]
    decimal? Fats = null,
    [property: Description("Product carbohydrates in grams per 100 grams of quantity, e.g. 21")]
    decimal? Carbs = null,
    [property: Description("Product sugar in grams per 100 grams of quantity, e.g. 7.8")]
    decimal? Sugar = null,
    [property: Description("Product salt in grams per 100 grams of quantity, e.g. 0.1")]
    decimal? Salt = null);