using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public class PageBuilder
{
    private readonly Page _page = new()
    {
        Id = Random.Shared.Next(),
        Notes = new List<Note>()
    };

    public PageBuilder(string? date)
    {
        _page.Date = string.IsNullOrWhiteSpace(date) ? DateTime.UtcNow : DateTime.Parse(date);
    }

    public Page Please() => _page;

    public PageBuilder WithNotes(MealType mealType, int count)
    {
        for (var i = 0; i < count; i++)
        {
            var note = Create.Note()
                .WithMealType(mealType)
                .WithPage(_page)
                .Please();
            
            _page.Notes.Add(note);
        }
        
        return this;
    }
}