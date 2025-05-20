using JetBrains.Annotations;

namespace FoodDiary.API.Features.Products.Contracts;

[PublicAPI]
public class GetProductByIdResponse
{
    public required int Id { get; init; }
    public required string Name { get; init; }
    public required int CaloriesCost { get; init; }
    public required int DefaultQuantity { get; init; }
    public required Category Category { get; init; }
    public required decimal? Protein { get; init; }
    public required decimal? Fats { get; init; }
    public required decimal? Carbs { get; init; }
    public required decimal? Sugar { get; init; }
    public required decimal? Salt { get; init; }
}

[PublicAPI]
public class Category
{
    public required int Id { get; init; }
    public required string Name { get; init; }
}