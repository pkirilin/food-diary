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

    public ProductBuilder(string? name)
    {
        _product.Name = string.IsNullOrWhiteSpace(name) ? $"TestProduct-{Guid.NewGuid()}" : name;
    }
    
    public Product Please() => _product;

    public ProductBuilder From(Product product)
    {
        _product.Id = product.Id;
        _product.Name = product.Name;
        _product.CaloriesCost = product.CaloriesCost;
        _product.DefaultQuantity = product.DefaultQuantity;
        _product.CategoryId = product.CategoryId;
        _product.Category = product.Category;
        _product.Notes = product.Notes;
        return this;
    }
    
    public ProductBuilder WithName(string name)
    {
        _product.Name = name;
        return this;
    }

    public ProductBuilder WithCategory(Category category)
    {
        _product.Category = category;
        return this;
    }
    
    public ProductBuilder WithExistingCategory(Category category)
    {
        _product.Category = null;
        _product.CategoryId = category.Id;
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