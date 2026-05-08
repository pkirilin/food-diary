using System.ComponentModel;

namespace FoodDiary.Application.Notes.Recognize;

public enum RecognitionStatus
{
    Recognized,
    NotAProduct
}

public record RecognizeNoteModelResponse(
    [property: Description("Recognized when at least one product/food is visible; NotAProduct when no food/product is on any image.")]
    RecognitionStatus Status,
    [property: Description("The recognized product. Required when Status is Recognized; null otherwise.")]
    RecognizedProduct? Product = null);

public record RecognizedProduct(
    [property: Description("Product name. Start with uppercase. Keep original language from the label, do not translate.")]
    string Name,
    [property: Description("Product quantity in grams. Default 100 when unknown.")]
    int? Quantity = null,
    [property: Description("Calories in kilocalories per 100 g. Never joules. Numeric only.")]
    decimal? Calories = null,
    [property: Description("Brand name from the label, if visible.")]
    string? BrandName = null,
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
