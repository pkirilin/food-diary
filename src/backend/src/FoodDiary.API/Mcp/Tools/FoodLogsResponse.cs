using System.Text.Json.Serialization;

namespace FoodDiary.API.Mcp.Tools;

public record FoodLogsResponse(DateOnly From, DateOnly To, IReadOnlyList<FoodLogsDay> Days, FoodLogsRangeTotals Totals);

public record FoodLogsRangeTotals(
    FoodLogsRangeTotal Calories,
    FoodLogsRangeTotal Protein,
    FoodLogsRangeTotal Fats,
    FoodLogsRangeTotal Carbs,
    FoodLogsRangeTotal Sugar,
    FoodLogsRangeTotal Salt);

public record FoodLogsRangeTotal(decimal Total, decimal DailyAverage, int CoveredItems, int TotalItems);

public record FoodLogsDay(DateOnly Date, IReadOnlyList<FoodLogsMeal> Meals, FoodLogsDayTotals Totals);

public record FoodLogsDayTotals(
    FoodLogsDayTotal Calories,
    FoodLogsDayTotal Protein,
    FoodLogsDayTotal Fats,
    FoodLogsDayTotal Carbs,
    FoodLogsDayTotal Sugar,
    FoodLogsDayTotal Salt);

public record FoodLogsDayTotal(decimal Total, int CoveredItems, int TotalItems);

public record FoodLogsMeal(string MealType, IReadOnlyList<FoodLog> Items);

public record FoodLog(
    FoodLogProduct Product,
    int Quantity,
    int Calories,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Protein,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Fats,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Carbs,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Sugar,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.Never)] decimal? Salt);

public record FoodLogProduct(int Id, string Name);
