using FoodDiary.Application.Notes.GetHistory;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

namespace FoodDiary.API.Mcp.Tools.FoodLogs;

public static class FoodLogsToolMapper
{
    public static GetFoodLogsResponse ToGetFoodLogsResponse(
        this GetNotesHistoryQueryResult result,
        DateOnly from,
        DateOnly to,
        int rangeDays,
        ICaloriesCalculator caloriesCalculator)
    {
        var notesByDate = result.Notes.ToLookup(note => note.Date);

        var days = Enumerable.Range(0, rangeDays)
            .Select(from.AddDays)
            .Select(date => ToFoodLogsDay(date, notesByDate[date], caloriesCalculator))
            .ToList();

        var totals = new FoodLogsRangeTotals(
            TotalOverDays(days, day => day.Totals.Calories),
            TotalOverDays(days, day => day.Totals.Protein),
            TotalOverDays(days, day => day.Totals.Fats),
            TotalOverDays(days, day => day.Totals.Carbs),
            TotalOverDays(days, day => day.Totals.Sugar),
            TotalOverDays(days, day => day.Totals.Salt));

        return new GetFoodLogsResponse(from, to, days, totals);
    }

    private static FoodLogsDay ToFoodLogsDay(DateOnly date, IEnumerable<Note> notes,
        ICaloriesCalculator caloriesCalculator)
    {
        var meals = notes
            .GroupBy(note => note.MealType)
            .OrderBy(meal => meal.Key)
            .Select(meal => new FoodLogsMeal(
                meal.Key.ToString(),
                meal.OrderBy(note => note.DisplayOrder)
                    .Select(note => ToFoodLog(note, caloriesCalculator))
                    .ToList()))
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

    private static FoodLogsRangeTotal TotalOverDays(IReadOnlyCollection<FoodLogsDay> days,
        Func<FoodLogsDay, FoodLogsDayTotal> selectDayTotal)
    {
        var dayTotals = days.Select(selectDayTotal).ToList();
        var total = dayTotals.Sum(dayTotal => dayTotal.Total);

        return new FoodLogsRangeTotal(
            total,
            RoundToHundredths(total / days.Count),
            dayTotals.Sum(dayTotal => dayTotal.CoveredItems),
            dayTotals.Sum(dayTotal => dayTotal.TotalItems));
    }

    private static FoodLogsDayTotal TotalOverItems(IReadOnlyCollection<FoodLog> items,
        Func<FoodLog, decimal?> selectValue)
    {
        var coveredValues = items.Select(selectValue).OfType<decimal>().ToList();

        return new FoodLogsDayTotal(coveredValues.Sum(), coveredValues.Count, items.Count);
    }

    private static FoodLog ToFoodLog(Note note, ICaloriesCalculator caloriesCalculator)
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