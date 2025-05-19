using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Dsl;

public class ProductBuilder
{
    private readonly Product _product = new()
    {
        Id = Random.Shared.Next(),
        CaloriesCost = 100,
        DefaultQuantity = 100,
        Category = Create.Category().Please(),
        Protein = 10,
        Fats = 5,
        Carbs = 3,
        Sugar = 8,
        Salt = 2
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
}