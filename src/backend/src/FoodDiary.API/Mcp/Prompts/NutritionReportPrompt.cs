using System.ComponentModel;
using FoodDiary.API.Mcp.Tools;
using FoodDiary.API.Mcp.Tools.FoodLogs;
using FoodDiary.Domain.Enums;
using ModelContextProtocol.Server;

namespace FoodDiary.API.Mcp.Prompts;

[McpServerPromptType]
public class NutritionReportPrompt
{
    private const string DefaultPeriod = "the last 7 days";

    private static readonly string MealTypes = string.Join(", ", Enum.GetNames<MealType>());

    [McpServerPrompt(Name = "nutrition_report"), Description("Nutrition report over a period described in your own words.")]
    public static string NutritionReport(
        [Description("""The period to report on, e.g. "last week", "last 14 days", "2026-09-01 to 2026-09-07". Defaults to the last 7 days.""")]
        string? period = null)
    {
        var requestedPeriod = string.IsNullOrWhiteSpace(period) ? DefaultPeriod : period.Trim();

        return
            $"""
            Write a nutrition report for this period: {requestedPeriod}

            ## Dates

            Resolve the period to concrete inclusive calendar dates relative to today, and state the resolved `from` and `to` at the top of the report. `get_food_logs` accepts at most {FoodLogsTool.MaxRangeDays} days per call: for a longer period, call it once per consecutive range of at most {FoodLogsTool.MaxRangeDays} days, then combine the ranges by summing totals, `coveredItems` and `totalItems`, and dividing the summed totals by the number of days in the whole period. Use `list_products` when you need a product's nutrition per 100 g.

            ## Analysis

            1. Totals and daily averages for calories, protein, fats, carbs, sugar and salt over the period.
            2. Which products eaten in the same meal combine well, and why.
            3. Which products eaten in the same meal do not combine well, and why.
            4. What to substitute for the products that do not combine well, preferring products already in the catalogue.

            ## Rules

            - Every nutrition figure and quantity carries a unit: `kcal` for calories, `g` for quantities and macros. Never write a bare one.
            - A total or daily average whose `coveredItems` is less than its `totalItems` is understated. Qualify it, e.g. "1850 kcal, based on 9 of 12 items", rather than reporting it flat.
            - When naming a meal, use the tokens `get_food_logs` returns: {MealTypes}.
            """;
    }
}
