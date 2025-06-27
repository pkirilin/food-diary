using System.Collections.Generic;
using JetBrains.Annotations;

namespace FoodDiary.API.Features.Products.Contracts;

[PublicAPI]
public record SearchProductsResponse(IReadOnlyCollection<SearchProductsResponse.Product> Products)
{
    public record Product(
        int Id,
        string Name,
        int DefaultQuantity,
        int Calories,
        decimal? Protein,
        decimal? Fats,
        decimal? Carbs,
        decimal? Sugar,
        decimal? Salt);
}