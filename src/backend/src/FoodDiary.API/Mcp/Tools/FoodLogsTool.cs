using System.ComponentModel;
using FoodDiary.Application.Notes.GetHistory;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using ModelContextProtocol;
using ModelContextProtocol.Server;

namespace FoodDiary.API.Mcp.Tools;

[McpServerToolType]
public class FoodLogsTool(GetNotesHistoryQueryHandler getNotesHistoryQueryHandler, ICaloriesCalculator caloriesCalculator)
{
    private const int MaxRangeDays = 31;

    private const string ToolDescription =
        """
        Food logs over a date range, grouped by day and meal, with nutrition totals per day and for the whole range.

        One item per product eaten per meal per date. `quantity` is grams, drinks included. `calories` is kilocalories; `protein`, `fats`, `carbs`, `sugar` and `salt` are grams (salt is sodium chloride, not sodium), already scaled to the quantity eaten. `from` and `to` are inclusive calendar dates with no time or timezone. Meals within a day run in order: Breakfast, SecondBreakfast, Lunch, AfternoonSnack, Dinner.

        A `null` nutrition value means the product has no value recorded for it: unknown, not zero. Totals sum only the items that have a value, so every total carries `coveredItems` (items with a value) and `totalItems` (all items). When `coveredItems` is less than `totalItems`, the total is understated: qualify it, e.g. "based on 9 of 12 items".

        Every date in the range is listed. A day with an empty `meals` had nothing logged; it has zero totals and counts toward `dailyAverage`. The range spans at most 31 days; split longer periods into several calls.
        """;

    private const string DateParameterDescription = "Inclusive calendar date, `yyyy-MM-dd`.";

    [McpServerTool(Name = "get_food_logs", ReadOnly = true, OpenWorld = false), Description(ToolDescription)]
    public async Task<FoodLogsResponse> GetFoodLogs(
        [Description(DateParameterDescription)] DateOnly from,
        [Description(DateParameterDescription)] DateOnly to,
        CancellationToken cancellationToken)
    {
        if (from > to)
        {
            throw new McpException($"`from` {from:yyyy-MM-dd} is after `to` {to:yyyy-MM-dd}.");
        }

        var rangeDays = to.DayNumber - from.DayNumber + 1;

        if (rangeDays > MaxRangeDays)
        {
            throw new McpException($"Requested {rangeDays} days; the maximum is {MaxRangeDays}. Split the range.");
        }

        var result = await getNotesHistoryQueryHandler.Handle(new GetNotesHistoryQuery(from, to), cancellationToken);

        var notesByDate = result.Notes.ToLookup(note => note.Date);

        var days = Enumerable.Range(0, rangeDays)
            .Select(from.AddDays)
            .Select(date => ToFoodLogsDay(date, notesByDate[date]))
            .ToList();

        var totals = new FoodLogsRangeTotals(
            TotalOverDays(days, day => day.Totals.Calories),
            TotalOverDays(days, day => day.Totals.Protein),
            TotalOverDays(days, day => day.Totals.Fats),
            TotalOverDays(days, day => day.Totals.Carbs),
            TotalOverDays(days, day => day.Totals.Sugar),
            TotalOverDays(days, day => day.Totals.Salt));

        return new FoodLogsResponse(from, to, days, totals);
    }

    private static FoodLogsRangeTotal TotalOverDays(IReadOnlyCollection<FoodLogsDay> days, Func<FoodLogsDay, FoodLogsDayTotal> selectDayTotal)
    {
        var dayTotals = days.Select(selectDayTotal).ToList();
        var total = dayTotals.Sum(dayTotal => dayTotal.Total);

        return new FoodLogsRangeTotal(
            total,
            RoundToHundredths(total / days.Count),
            dayTotals.Sum(dayTotal => dayTotal.CoveredItems),
            dayTotals.Sum(dayTotal => dayTotal.TotalItems));
    }

    private FoodLogsDay ToFoodLogsDay(DateOnly date, IEnumerable<Note> notes)
    {
        var meals = notes
            .GroupBy(note => note.MealType)
            .OrderBy(meal => meal.Key)
            .Select(meal => new FoodLogsMeal(
                meal.Key.ToString(),
                meal.OrderBy(note => note.DisplayOrder).Select(ToFoodLog).ToList()))
            .ToList();

        var items = meals.SelectMany(meal => meal.Items).ToList();

        var totals = new FoodLogsDayTotals(
            TotalOverItems(items, item => item.Calories),
            TotalOverItems(items, item => item.Protein),
            TotalOverItems(items, item => item.Fats),
            TotalOverItems(items, item => item.Carbs),
            TotalOverItems(items, item => item.Sugar),
            TotalOverItems(items, item => item.Salt));

        return new FoodLogsDay(date, meals, totals);
    }

    private static FoodLogsDayTotal TotalOverItems(IReadOnlyCollection<FoodLog> items, Func<FoodLog, decimal?> selectValue)
    {
        var coveredValues = items.Select(selectValue).OfType<decimal>().ToList();

        return new FoodLogsDayTotal(coveredValues.Sum(), coveredValues.Count, items.Count);
    }

    private FoodLog ToFoodLog(Note note)
    {
        var product = note.Product!;

        return new FoodLog(
            new FoodLogProduct(product.Id, product.Name),
            note.ProductQuantity,
            caloriesCalculator.Calculate(note),
            Scale(product.Protein, note.ProductQuantity),
            Scale(product.Fats, note.ProductQuantity),
            Scale(product.Carbs, note.ProductQuantity),
            Scale(product.Sugar, note.ProductQuantity),
            Scale(product.Salt, note.ProductQuantity));
    }

    private static decimal? Scale(decimal? per100Grams, int quantity) =>
        per100Grams is { } value ? RoundToHundredths(value * quantity / 100) : null;

    private static decimal RoundToHundredths(decimal value) =>
        Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
