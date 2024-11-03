using FoodDiary.ComponentTests.Infrastructure.DateAndTime;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public class NoteBuilder
{
    private int? _id;
    private DateOnly _date = DateOnly.Parse(FakeDateTimeProvider.CurrentFakeDateAsString);
    private MealType _mealType = MealType.Breakfast;
    private Product _product = Create.Product().Please();
    private int _productId;
    private int _productQuantity = 100;
    private int _displayOrder = 1;
    
    public Note Please() => new()
    {
        Id = _id ?? Random.Shared.Next(),
        Date = _date,
        MealType = _mealType,
        Product = _product,
        ProductId = _productId,
        ProductQuantity = _productQuantity,
        DisplayOrder = _displayOrder
    };
    
    public NoteBuilder WithDate(string date)
    {
        _date = DateOnly.Parse(date);
        return this;
    }

    public NoteBuilder WithProduct(Product product, int quantity)
    {
        _product = product;
        _productQuantity = quantity;
        return this;
    }

    public NoteBuilder WithProduct(string productName, int quantity)
    {
        _product = Create.Product(productName).Please();
        _productQuantity = quantity;
        return this;
    }
    
    public NoteBuilder WithMealType(MealType mealType)
    {
        _mealType = mealType;
        return this;
    }
    
    public NoteBuilder WithDisplayOrder(int displayOrder)
    {
        _displayOrder = displayOrder;
        return this;
    }

    public NoteBuilder From(Note note)
    {
        _id = note.Id;
        _date = note.Date;
        _mealType = note.MealType;
        _product = note.Product;
        _productId = note.ProductId;
        _productQuantity = note.ProductQuantity;
        _displayOrder = note.DisplayOrder;
        return this;
    }
}