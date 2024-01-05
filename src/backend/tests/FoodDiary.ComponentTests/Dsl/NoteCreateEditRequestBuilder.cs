using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public class NoteCreateEditRequestBuilder
{
    private MealType _mealType;
    private int _productQuantity;
    private int _displayOrder;
    private int _productId;
    private int _pageId;
    
    public NoteCreateEditRequest Please() => new()
    {
        MealType = _mealType,
        ProductQuantity = _productQuantity,
        DisplayOrder = _displayOrder,
        ProductId = _productId,
        PageId = _pageId
    };

    public NoteCreateEditRequestBuilder From(Note note)
    {
        _mealType = note.MealType;
        _productQuantity = note.ProductQuantity;
        _displayOrder = note.DisplayOrder;
        _productId = note.Product.Id;
        _pageId = note.Page.Id;
        return this;
    }
    
    public NoteCreateEditRequestBuilder WithProduct(Product product)
    {
        _productId = product.Id;
        return this;
    }

    public NoteCreateEditRequestBuilder WithProductQuantity(int productQuantity)
    {
        _productQuantity = productQuantity;
        return this;
    }
}