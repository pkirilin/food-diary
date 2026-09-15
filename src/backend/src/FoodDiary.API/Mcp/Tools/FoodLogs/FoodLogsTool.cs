using System.ComponentModel;
using FoodDiary.Application.Notes.GetHistory;
using FoodDiary.Domain.Utils;
using ModelContextProtocol;
using ModelContextProtocol.Server;

namespace FoodDiary.API.Mcp.Tools.FoodLogs;

[McpServerToolType]
public class FoodLogsTool(
    GetNotesHistoryQueryHandler getNotesHistoryQueryHandler,
    ICaloriesCalculator caloriesCalculator)
{
    internal const int MaxRangeDays = 31;

    private const string GetFoodLogsToolDescription =
        """
        Food logs over a date range, grouped by day and meal, with nutrition totals per day and for the whole range.

        One item per product eaten per meal per date. `quantity` is grams, drinks included. `calories` is kilocalories; `protein`, `fats`, `carbs`, `sugar` and `salt` are grams (salt is sodium chloride, not sodium), already scaled to the quantity eaten. `from` and `to` are inclusive calendar dates with no time or timezone. Meals within a day run in order: Breakfast, SecondBreakfast, Lunch, AfternoonSnack, Dinner.

        A `null` nutrition value means the product has no value recorded for it: unknown, not zero. Totals sum only the items that have a value, so every total carries `coveredItems` (items with a value) and `totalItems` (all items). When `coveredItems` is less than `totalItems`, the total is understated: qualify it, e.g. "based on 9 of 12 items".

        Every date in the range is listed. A day with an empty `meals` had nothing logged; it has zero totals and counts toward `dailyAverage`. The range spans at most 31 days; split longer periods into several calls.
        """;

    private const string DateParameterDescription = "Inclusive calendar date, `yyyy-MM-dd`.";

    [McpServerTool(Name = "get_food_logs", ReadOnly = true, OpenWorld = false)]
    [Description(GetFoodLogsToolDescription)]
    public async Task<GetFoodLogsResponse> GetFoodLogs(
        [Description(DateParameterDescription)]
        DateOnly from,
        [Description(DateParameterDescription)]
        DateOnly to,
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

        return result.ToGetFoodLogsResponse(from, to, rangeDays, caloriesCalculator);
    }
}