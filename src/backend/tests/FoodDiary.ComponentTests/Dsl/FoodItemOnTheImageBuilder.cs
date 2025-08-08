using FoodDiary.Application.Notes.Recognize;

namespace FoodDiary.ComponentTests.Dsl;

public class FoodItemOnTheImageBuilder
{
    private string _name = string.Empty;
    private int _calories = 100;
    private int _quantity = 100;
    private string? _brandName;
    private decimal? _protein;
    private decimal? _fats;
    private decimal? _carbs;
    private decimal? _sugar;
    private decimal? _salt;
    
    public FoodItemOnTheImage Please()
    {
        return new FoodItemOnTheImage(
            Name: _name,
            Calories: _calories,
            Quantity: _quantity,
            BrandName: _brandName,
            Protein: _protein,
            Fats: _fats,
            Carbs: _carbs,
            Sugar: _sugar,
            Salt: _salt
        );
    }
    
    public FoodItemOnTheImageBuilder WithProduct(string name)
    {
        _name = name;
        return this;
    }
    
    public FoodItemOnTheImageBuilder WithCalories(int calories)
    {
        _calories = calories;
        return this;
    }
    
    public FoodItemOnTheImageBuilder WithQuantity(int quantity)
    {
        _quantity = quantity;
        return this;
    }

    public FoodItemOnTheImageBuilder WithBrandName(string? brandName)
    {
        _brandName = brandName;
        return this;
    }
    
    public FoodItemOnTheImageBuilder WithNutritionComponents(
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