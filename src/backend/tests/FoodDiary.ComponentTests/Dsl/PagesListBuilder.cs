using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Dsl;

public class PagesListBuilder
{
    private readonly int _count;
    private DateOnly _startDate = DateOnly.FromDateTime(DateTime.UtcNow);
    private int _intervalInDays = 1;

    public PagesListBuilder(int count)
    {
        _count = count;
    }
    
    public Page[] Please()
    {
        var pages = new List<Page>(_count);
        var currentDate = _startDate;

        for (var i = 0; i < _count; i++)
        {
            var page = Create.Page(currentDate.ToString("O")).Please();
            pages.Add(page);
            currentDate = currentDate.AddDays(_intervalInDays);
        }
        
        return pages.ToArray();
    }

    public PagesListBuilder StartingFrom(string date)
    {
        _startDate = DateOnly.Parse(date);
        return this;
    }
    
    public PagesListBuilder WithOneDayInterval()
    {
        _intervalInDays = 1;
        return this;
    }
}