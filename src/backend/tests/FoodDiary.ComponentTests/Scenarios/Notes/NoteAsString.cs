using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Scenarios.Notes;

public static class NoteAsString
{
    private static int _nextId;
    private static int _nextDisplayOrder;
    
    public static readonly Page TestPage = new()
    {
        Id = 1,
        Date = DateTime.UtcNow
    };
    
    private static readonly Category TestCategory = new()
    {
        Id = 1,
        Name = "Test Category"
    };
    
    public static Note Parse(string text)
    {
        var tokens = text.Split(", ");
        var mealType = Enum.Parse<MealType>(tokens[0]);
        var productName = tokens[1];
        var productQuantity = int.Parse(tokens[2]);
        
        return new Note
        {
            Id = ++_nextId,
            MealType = mealType,
            ProductQuantity = productQuantity,
            DisplayOrder = ++_nextDisplayOrder,
            Page = TestPage,
            Product = new Product
            {
                Name = productName,
                CaloriesCost = 123,
                DefaultQuantity = 123,
                Category = TestCategory
            }
        };
    }
}