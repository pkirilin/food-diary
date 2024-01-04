using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Dsl;

public class ProductBuilder
{
    private readonly Product _product = new()
    {
        Id = Random.Shared.Next(),
        CaloriesCost = 100,
        DefaultQuantity = 100,
        Category = Create.Category().Please()
    };

    public ProductBuilder(string name)
    {
        _product.Name = name;
    }
    
    public Product Please() => _product;

    public ProductBuilder WithId(int id)
    {
        _product.Id = id;
        return this;
    }

    public ProductBuilder WithCategory(Category category)
    {
        _product.Category = category;
        return this;
    }

    public ProductBuilder WithDefaultQuantity(int defaultQuantity)
    {
        _product.DefaultQuantity = defaultQuantity;
        return this;
    }
    
    public ProductBuilder WithCaloriesCost(int caloriesCost)
    {
        _product.CaloriesCost = caloriesCost;
        return this;
    }
}