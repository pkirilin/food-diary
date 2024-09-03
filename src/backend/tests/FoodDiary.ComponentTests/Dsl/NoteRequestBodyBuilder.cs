using FoodDiary.Contracts.Notes;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public class NoteRequestBodyBuilder
{
    private DateOnly _date;
    private MealType _mealType;
    private int _productQuantity;
    private int _displayOrder;
    private int _productId;

    public NoteRequestBody Please() => new()
    {
        Date = _date,
        MealType = _mealType,
        ProductQuantity = _productQuantity,
        DisplayOrder = _displayOrder,
        ProductId = _productId
    };

    public NoteRequestBodyBuilder From(Note note)
    {
        _date = note.Date.GetValueOrDefault();
        _mealType = note.MealType;
        _productQuantity = note.ProductQuantity;
        _displayOrder = note.DisplayOrder;
        _productId = note.Product.Id;
        return this;
    }
    
    public NoteRequestBodyBuilder WithProduct(Product product)
    {
        _productId = product.Id;
        return this;
    }

    public NoteRequestBodyBuilder WithProductQuantity(int productQuantity)
    {
        _productQuantity = productQuantity;
        return this;
    }
}