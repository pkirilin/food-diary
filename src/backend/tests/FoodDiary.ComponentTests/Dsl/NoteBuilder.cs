using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public class NoteBuilder
{
    private readonly Note _note = new()
    {
        Id = Random.Shared.Next()
    };

    public NoteBuilder(MealType mealType)
    {
        _note.MealType = mealType;
    }

    public Note Please() => _note;
    
    public NoteBuilder WithPage(Page page)
    {
        _note.Page = page;
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
}