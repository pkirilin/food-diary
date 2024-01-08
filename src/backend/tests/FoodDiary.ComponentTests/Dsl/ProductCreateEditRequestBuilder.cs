using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Dsl;

public class ProductCreateEditRequestBuilder
{
    private string _name = string.Empty;
    private int _caloriesCost;
    private int _defaultQuantity;
    private int _categoryId;

    public ProductCreateEditRequest Please() => new()
    {
        Name = _name,
        CaloriesCost = _caloriesCost,
        DefaultQuantity = _defaultQuantity,
        CategoryId = _categoryId
    };

    public ProductCreateEditRequestBuilder From(Product product)
    {
        _name = product.Name;
        _caloriesCost = product.CaloriesCost;
        _defaultQuantity = product.DefaultQuantity;
        _categoryId = product.Category.Id;
        return this;
    }

    public ProductCreateEditRequestBuilder WithName(string name)
    {
        _name = name;
        return this;
    }
}