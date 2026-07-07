using FoodDiary.Application.Products.SuggestNutrition;

namespace FoodDiary.ComponentTests.Dsl;

public class SuggestNutritionModelResponseBuilder
{
    private decimal? _calories;
    private decimal? _protein;
    private decimal? _fats;
    private decimal? _carbs;
    private decimal? _sugar;
    private decimal? _salt;

    public SuggestedNutrition Please() =>
        new(
            Calories: _calories,
            Protein: _protein,
            Fats: _fats,
            Carbs: _carbs,
            Sugar: _sugar,
            Salt: _salt);

    public SuggestNutritionModelResponseBuilder WithCalories(decimal? calories)
    {
        _calories = calories;
        return this;
    }

    public SuggestNutritionModelResponseBuilder WithNutritionComponents(
        decimal? protein,
        decimal? fats,
        decimal? carbs,
        decimal? sugar,
        decimal? salt)
    {
        _protein = protein;
        _fats = fats;
        _carbs = carbs;
        _sugar = sugar;
        _salt = salt;
        return this;
    }
}
