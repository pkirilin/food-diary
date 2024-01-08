using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public class NoteBuilder
{
    private readonly Note _note = new()
    {
        Id = Random.Shared.Next(),
        MealType = MealType.Breakfast,
        Page = Create.Page(DateTime.UtcNow.ToString("u")[..10]).Please(),
        Product = Create.Product().Please(),
        ProductQuantity = 100
    };

    public Note Please() => _note;
    
    public NoteBuilder WithPage(Page page)
    {
        _note.Page = page;
        return this;
    }
    
    public NoteBuilder WithExistingPage(Page page)
    {
        _note.Page = null;
        _note.PageId = page.Id;
        return this;
    }

    public NoteBuilder WithMealType(MealType mealType)
    {
        _note.MealType = mealType;
        return this;
    }
    
    public NoteBuilder WithDisplayOrder(int displayOrder)
    {
        _note.DisplayOrder = displayOrder;
        return this;
    }
    
    public NoteBuilder WithProduct(Product product, int quantity)
    {
        _note.Product = product;
        _note.ProductQuantity = quantity;
        return this;
    }
    
    public NoteBuilder WithExistingProduct(Product product)
    {
        _note.Product = null;
        _note.ProductId = product.Id;
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
        _note.MealType = note.MealType;
        _note.PageId = note.PageId;
        _note.ProductId = note.ProductId;
        _note.ProductQuantity = note.ProductQuantity;
        _note.DisplayOrder = note.DisplayOrder;
        _note.Page = note.Page;
        _note.Product = note.Product;
        return this;
    }
}