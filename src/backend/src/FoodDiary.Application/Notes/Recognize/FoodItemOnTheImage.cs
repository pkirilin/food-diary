using System.ComponentModel;

namespace FoodDiary.Application.Notes.Recognize;

public class FoodItemOnTheImage
{
    [Description("Product name, e.g. Bread. Always start with a uppercase letter, avoid CAPS")]
    public required string Name { get; init; }

    [Description("Product quantity in grams, e.g. 50")]
    public required int Quantity { get; init; } = 100;

    [Description("Product calories in kilocalories per 100 grams of quantity, e.g. 125")]
    public required int Calories { get; init; } = 100;
    
    [Description("Product brand name, e.g. Nestle")]
    public string? BrandName { get; init; }

    [Description("Product protein in grams per 100 grams of quantity, e.g. 1.23")]
    public decimal? Protein { get; init; }
    
    [Description("Product fats in grams per 100 grams of quantity, e.g. 10.45")]
    public decimal? Fats { get; init; }
    
    [Description("Product carbohydrates in grams per 100 grams of quantity, e.g. 21")]
    public decimal? Carbs { get; init; }
    
    [Description("Product sugar in grams per 100 grams of quantity, e.g. 7.8")]
    public decimal? Sugar { get; init; }
    
    [Description("Product salt in grams per 100 grams of quantity, e.g. 0.1")]
    public decimal? Salt { get; init; }
}