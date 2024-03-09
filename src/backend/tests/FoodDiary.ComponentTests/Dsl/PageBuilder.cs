using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public class PageBuilder
{
    private readonly Page _page = new()
    {
        Id = Random.Shared.Next(),
        Date = DateOnly.FromDateTime(DateTime.UtcNow),
        Notes = new List<Note>()
    };

    public PageBuilder(string? date)
    {
        _page.Date = string.IsNullOrWhiteSpace(date)
            ? DateOnly.FromDateTime(DateTime.UtcNow)
            : DateOnly.Parse(date);
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