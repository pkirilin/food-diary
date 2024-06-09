using FoodDiary.Application.Notes.Recognize;

namespace FoodDiary.ComponentTests.Dsl;

public class RecognizeNoteItemBuilder
{
    private string _name = string.Empty;
    private int _caloriesCost = 100;
    private int _quantity = 100;
    
    public RecognizeNoteItem Please()
    {
        var product = new RecognizeProductItem(_name, _caloriesCost);
        
        return new RecognizeNoteItem(product, _quantity);
    }
    
    public RecognizeNoteItemBuilder WithProduct(string name, int caloriesCost)
    {
        _name = name;
        _caloriesCost = caloriesCost;
        return this;
    }
    
    public RecognizeNoteItemBuilder WithQuantity(int quantity)
    {
        _quantity = quantity;
        return this;
    }
}