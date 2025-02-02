using System.Collections.Generic;
using JetBrains.Annotations;

namespace FoodDiary.API.Features.Products.Contracts;

[PublicAPI]
public record SearchProductsResult(IReadOnlyCollection<SearchProductsResult.Product> Products)
{
    public record Product(int Id, string Name, int DefaultQuantity);
}