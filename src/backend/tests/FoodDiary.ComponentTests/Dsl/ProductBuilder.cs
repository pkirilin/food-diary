using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Dsl;

public class ProductBuilder(string? name)
{
    private int _id = Random.Shared.Next();
    private string? _name = string.IsNullOrWhiteSpace(name) ? $"TestProduct-{Guid.NewGuid()}" : name;
    private int _defaultQuantity = 100;
    private int _categoryId;
    private Category? _category = Create.Category().Please();
    private int _calories = 100;
    private decimal? _protein = 10;
    private decimal? _fats = 5;
    private decimal? _carbs = 3;
    private decimal? _sugar = 8;
    private decimal? _salt = 2;

    public Product Please() => new()
    {
        Id = _id,
        Name = _name,
        CaloriesCost = _calories,
        DefaultQuantity = _defaultQuantity,
        Category = _category,
        CategoryId = _categoryId,
        Protein = _protein,
        Fats = _fats,
        Carbs = _carbs,
        Sugar = _sugar,
        Salt = _salt
    };

    public ProductBuilder From(Product product)
    {
        _id = product.Id;
        _name = product.Name;
        _calories = product.CaloriesCost;
        _defaultQuantity = product.DefaultQuantity;
        _categoryId = product.CategoryId;
        _category = product.Category;
        _protein = product.Protein;
        _fats = product.Fats;
        _carbs = product.Carbs;
        _sugar = product.Sugar;
        _salt = product.Salt;
        return this;
    }

    public ProductBuilder WithName(string name)
    {
        _name = name;
        return this;
    }

    public ProductBuilder WithCalories(int calories)
    {
        _calories = calories;
        return this;
    }

    public ProductBuilder WithNutritionComponents(
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