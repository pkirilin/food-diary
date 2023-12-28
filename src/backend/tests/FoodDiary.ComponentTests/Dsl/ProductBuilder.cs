using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Dsl;

public class ProductBuilder
{
    private readonly Product _product = new()
    {
        Id = Random.Shared.Next(),
        CaloriesCost = 100,
        DefaultQuantity = 100
    };

    public ProductBuilder(string name)
    {
        _product.Name = name;
    }
    
    public Product Please() => _product;

    public ProductBuilder WithCategory(Category category)
    {
        _product.Category = category;
        return this;
    }
    
    public ProductBuilder WithCategoryId(int categoryId)
    {
        _product.CategoryId = categoryId;
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