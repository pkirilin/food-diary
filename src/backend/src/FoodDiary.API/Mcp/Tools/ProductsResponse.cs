using System.Text.Json.Serialization;

namespace FoodDiary.API.Mcp.Tools;

public record ProductsResponse(IReadOnlyList<ProductsResponse.Product> Products, int PageNumber, int PageSize, int TotalCount)
{
    public record Product(
        int Id,
        string Name,
        ProductCategory Category,
        int DefaultQuantity,
        // ReSharper disable once InconsistentNaming
        ProductNutrition Per100g);

    public record ProductCategory(string Name);

    public record ProductNutrition(
        int Calories,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)]
        decimal? Protein,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)]
        decimal? Fats,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)]
        decimal? Carbs,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)]
        decimal? Sugar,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)]
        decimal? Salt);
};
