using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Dsl;

public class CategoryBuilder(string? name)
{
    private readonly Category _category = new()
    {
        Id = Random.Shared.Next(),
        Name = string.IsNullOrWhiteSpace(name) ? $"TestCategory-{Guid.NewGuid()}" : name,
        Products = new List<Product>()
    };

    public Category Please() => _category;

    public CategoryBuilder From(Category category)
    {
        _category.Id = category.Id;
        _category.Name = category.Name;
        return this;
    }

    public CategoryBuilder WithName(string name)
    {
        _category.Name = name;
        return this;
    }
}