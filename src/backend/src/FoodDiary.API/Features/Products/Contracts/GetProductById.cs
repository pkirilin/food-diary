using JetBrains.Annotations;

namespace FoodDiary.API.Features.Products.Contracts;

[PublicAPI]
public class GetProductByIdResponse
{
    public required int Id { get; init; }
    public required string Name { get; init; } = null!;
    public required int CaloriesCost { get; init; }
    public required int DefaultQuantity { get; init; }
    public required Category Category { get; init; } = null!;
}

[PublicAPI]
public class Category
{
    public required int Id { get; init; }
    public required string Name { get; init; } = null!;
}