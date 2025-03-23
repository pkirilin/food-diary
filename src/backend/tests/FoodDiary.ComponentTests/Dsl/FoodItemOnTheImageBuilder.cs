using FoodDiary.Application.Notes.Recognize;

namespace FoodDiary.ComponentTests.Dsl;

public class FoodItemOnTheImageBuilder
{
    private string _name = string.Empty;
    private int _caloriesCost = 100;
    private int _quantity = 100;
    
    public FoodItemOnTheImage Please()
    {
        return new FoodItemOnTheImage
        {
            Name = _name,
            CaloriesCost = _caloriesCost,
            Quantity = _quantity
        };
    }
    
    public FoodItemOnTheImageBuilder WithProduct(string name, int caloriesCost)
    {
        _name = name;
        _caloriesCost = caloriesCost;
        return this;
    }
    
    public FoodItemOnTheImageBuilder WithQuantity(int quantity)
    {
        _quantity = quantity;
        return this;
    }
}