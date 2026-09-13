using System.Text.Json.Serialization;

namespace FoodDiary.API.Mcp.Tools;

public record ProductsResponse(IReadOnlyList<CatalogueProduct> Products, int PageNumber, int PageSize, int TotalCount);

public record CatalogueProduct(int Id, string Name, CatalogueProductCategory Category, int DefaultQuantity, CatalogueProductNutrition Per100g);

public record CatalogueProductCategory(string Name);

public record CatalogueProductNutrition(
    int Calories,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Protein,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Fats,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Carbs,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Sugar,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Salt);
