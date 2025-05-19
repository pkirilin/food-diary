using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Dsl;

public class ProductCreateEditRequestBuilder
{
    private string _name = string.Empty;
    private int _caloriesCost;
    private int _defaultQuantity;
    private int _categoryId;
    private decimal? _protein;
    private decimal? _fats;
    private decimal? _carbs;
    private decimal? _sugar;
    private decimal? _salt;

    public ProductCreateEditRequest Please() => new()
    {
        Name = _name,
        CaloriesCost = _caloriesCost,
        DefaultQuantity = _defaultQuantity,
        CategoryId = _categoryId,
        Protein = _protein,
        Fats = _fats,
        Carbs = _carbs,
        Sugar = _sugar,
        Salt = _salt
    };

    public ProductCreateEditRequestBuilder From(Product product)
    {
        _name = product.Name;
        _caloriesCost = product.CaloriesCost;
        _defaultQuantity = product.DefaultQuantity;
        _categoryId = product.Category.Id;
        _protein = product.Protein;
        _fats = product.Fats;
        _carbs = product.Carbs;
        _sugar = product.Sugar;
        _salt = product.Salt;
        return this;
    }

    public ProductCreateEditRequestBuilder WithName(string name)
    {
        _name = name;
        return this;
    }
}