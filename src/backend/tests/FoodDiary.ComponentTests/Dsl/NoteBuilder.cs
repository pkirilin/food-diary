using FoodDiary.ComponentTests.Infrastructure.DateAndTime;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public class NoteBuilder
{
    private readonly Note _note = new()
    {
        Id = Random.Shared.Next(),
        Date = DateOnly.Parse(FakeDateTimeProvider.CurrentFakeDateAsString),
        MealType = MealType.Breakfast,
        Product = Create.Product().Please(),
        ProductQuantity = 100
    };

    public Note Please() => _note;
    
    public NoteBuilder WithDate(string date)
    {
        _note.Date = DateOnly.Parse(date);
        return this;
    }

    public NoteBuilder WithProduct(Product product, int quantity)
    {
        _note.Product = product;
        _note.ProductQuantity = quantity;
        return this;
    }

    public NoteBuilder WithProduct(string productName, int quantity)
    {
        _note.Product = Create.Product(productName).Please();
        _note.ProductQuantity = quantity;
        return this;
    }

    public NoteBuilder From(Note note)
    {
        _note.Id = note.Id;
        _note.Date = note.Date;
        _note.MealType = note.MealType;
        _note.ProductId = note.ProductId;
        _note.ProductQuantity = note.ProductQuantity;
        _note.DisplayOrder = note.DisplayOrder;
        _note.Product = note.Product;
        return this;
    }
}