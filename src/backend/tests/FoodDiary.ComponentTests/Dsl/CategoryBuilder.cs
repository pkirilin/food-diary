using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Dsl;

public class CategoryBuilder
{
    private readonly Category _category = new()
    {
        Id = Random.Shared.Next(),
        Products = new List<Product>()
    };

    public CategoryBuilder(string? name)
    {
        _category.Name = string.IsNullOrWhiteSpace(name) ? $"TestCategory-{Guid.NewGuid()}" : name;
    }

    public Category Please() => _category;

    public CategoryBuilder WithId(int id)
    {
        _category.Id = id;
        return this;
    }
}