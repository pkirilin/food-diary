using System.Text.Json.Serialization;
using JetBrains.Annotations;

namespace FoodDiary.API.Mcp.Tools.FoodLogs;

[PublicAPI]
public record GetFoodLogsResponse(
    DateOnly From,
    DateOnly To,
    IReadOnlyList<FoodLogsDay> Days,
    FoodLogsRangeTotals Totals);

[PublicAPI]
public record FoodLogsRangeTotals(
    FoodLogsRangeTotal Calories,
    FoodLogsRangeTotal Protein,
    FoodLogsRangeTotal Fats,
    FoodLogsRangeTotal Carbs,
    FoodLogsRangeTotal Sugar,
    FoodLogsRangeTotal Salt);

[PublicAPI]
public record FoodLogsRangeTotal(decimal Total, decimal DailyAverage, int CoveredItems, int TotalItems);

[PublicAPI]
public record FoodLogsDay(DateOnly Date, IReadOnlyList<FoodLogsMeal> Meals, FoodLogsDayTotals Totals);

[PublicAPI]
public record FoodLogsDayTotals(
    FoodLogsDayTotal Calories,
    FoodLogsDayTotal Protein,
    FoodLogsDayTotal Fats,
    FoodLogsDayTotal Carbs,
    FoodLogsDayTotal Sugar,
    FoodLogsDayTotal Salt);

[PublicAPI]
public record FoodLogsDayTotal(decimal Total, int CoveredItems, int TotalItems);

[PublicAPI]
public record FoodLogsMeal(string MealType, IReadOnlyList<FoodLog> Items);

[PublicAPI]
public record FoodLog(
    FoodLogProduct Product,
    int Quantity,
    int Calories,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Protein,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Fats,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Carbs,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Sugar,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Salt);

[PublicAPI]
public record FoodLogProduct(int Id, string Name);
