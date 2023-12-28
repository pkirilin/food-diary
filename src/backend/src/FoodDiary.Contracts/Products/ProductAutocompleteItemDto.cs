using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Contracts.Products;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
public class ProductAutocompleteItemDto
{
    public int Id { get; init; }

    public string Name { get; init; }

    public int DefaultQuantity { get; init; }
}