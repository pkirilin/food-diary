using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Dsl;

public class PageBuilder
{
    private readonly Page _page = new()
    {
        Id = Random.Shared.Next()
    };

    public PageBuilder(string date)
    {
        _page.Date = DateTime.Parse(date);
    }

    public Page Please() => _page;

    public PageBuilder WithId(int id)
    {
        _page.Id = id;
        return this;
    }
}