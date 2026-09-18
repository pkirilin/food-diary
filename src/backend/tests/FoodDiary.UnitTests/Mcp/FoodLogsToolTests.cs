using System.Text.Json;
using System.Text.Json.Nodes;
using FoodDiary.API.Mcp.Tools.FoodLogs;
using FoodDiary.Application.Notes.GetHistory;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories.v2;
using FoodDiary.Infrastructure.Utils;
using ModelContextProtocol;
using Moq;

namespace FoodDiary.UnitTests.Mcp;

public class FoodLogsToolTests
{
    private static readonly DateOnly September1 = new(2026, 9, 1);

    private readonly Mock<INotesRepository> _notesRepository = new();
    private readonly List<Note> _notes = [];

    public FoodLogsToolTests()
    {
        _notesRepository
            .Setup(r => r.FindByDateRange(It.IsAny<DateOnly>(), It.IsAny<DateOnly>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DateOnly from, DateOnly to, CancellationToken _) =>
                _notes.Where(n => n.Date >= from && n.Date <= to).ToList());
    }

    private static Product Oatmeal(decimal? sugar = null, decimal? salt = null) => new()
    {
        Id = 42,
        Name = "Oatmeal",
        CaloriesCost = 366,
        Protein = 13.0m,
        Fats = 7.0m,
        Carbs = 62.0m,
        Sugar = sugar,
        Salt = salt
    };

    private static Product ProductWithoutNutrition(int id, string name) => new()
    {
        Id = id,
        Name = name,
        Protein = null,
        Fats = null,
        Carbs = null,
        Sugar = null,
        Salt = null
    };

    private static Product Juice() => new()
    {
        Id = 7,
        Name = "Juice",
        CaloriesCost = 45,
        Protein = null,
        Fats = null,
        Carbs = 10.4m,
        Sugar = 9.8m,
        Salt = null
    };

    private void GivenNote(DateOnly date, MealType mealType, Product product, int quantity, int displayOrder = 0)
    {
        _notes.Add(new Note
        {
            Date = date,
            MealType = mealType,
            ProductId = product.Id,
            Product = product,
            ProductQuantity = quantity,
            DisplayOrder = displayOrder
        });
    }

    private async Task<JsonNode> GetFoodLogs(DateOnly from, DateOnly to)
    {
        var tool = new FoodLogsTool(new GetNotesHistoryQueryHandler(_notesRepository.Object), new CaloriesCalculator());

        var response = await tool.GetFoodLogs(from, to, CancellationToken.None);

        return JsonSerializer.SerializeToNode(response, McpJsonUtilities.DefaultOptions)!;
    }

    [Fact]
    public async Task Item_CarriesProductAndNutritionScaledToQuantityEaten()
    {
        GivenNote(September1, MealType.Breakfast, Oatmeal(), quantity: 60);

        var json = await GetFoodLogs(September1, September1);

        ShouldBeJson(json["days"]![0]!["meals"]![0]!["items"]![0],
            """
            {
              "product": { "id": 42, "name": "Oatmeal" },
              "quantity": 60,
              "calories": 219,
              "protein": 7.8,
              "fats": 4.2,
              "carbs": 37.2,
              "sugar": null,
              "salt": null
            }
            """);
    }

    [Fact]
    public async Task Notes_AreGroupedByDayAndMeal_InDiaryOrder()
    {
        var september2 = September1.AddDays(1);
        var apple = ProductWithoutNutrition(1, "Apple");
        var bread = ProductWithoutNutrition(2, "Bread");
        var soup = ProductWithoutNutrition(3, "Soup");
        GivenNote(september2, MealType.Lunch, soup, quantity: 300);
        GivenNote(September1, MealType.Dinner, soup, quantity: 250);
        GivenNote(September1, MealType.Breakfast, apple, quantity: 150, displayOrder: 1);
        GivenNote(September1, MealType.SecondBreakfast, bread, quantity: 50);
        GivenNote(September1, MealType.Breakfast, bread, quantity: 40, displayOrder: 0);

        var json = await GetFoodLogs(September1, september2);

        var days = json["days"]!.AsArray().Select(day => new
        {
            Date = day!["date"]!.GetValue<string>(),
            Meals = day["meals"]!.AsArray().Select(meal => new
            {
                MealType = meal!["mealType"]!.GetValue<string>(),
                Products = meal["items"]!.AsArray().Select(item => item!["product"]!["name"]!.GetValue<string>())
            })
        });
        days.Should().BeEquivalentTo(
            [
                new
                {
                    Date = "2026-09-01",
                    Meals = new[]
                    {
                        new { MealType = "Breakfast", Products = new[] { "Bread", "Apple" } },
                        new { MealType = "SecondBreakfast", Products = new[] { "Bread" } },
                        new { MealType = "Dinner", Products = new[] { "Soup" } }
                    }
                },
                new
                {
                    Date = "2026-09-02",
                    Meals = new[]
                    {
                        new { MealType = "Lunch", Products = new[] { "Soup" } }
                    }
                }
            ],
            options => options.WithStrictOrdering());
    }

    [Fact]
    public async Task DaysWithNothingLogged_AppearWithEmptyMeals()
    {
        GivenNote(September1.AddDays(1), MealType.Lunch, Oatmeal(), quantity: 60);

        var json = await GetFoodLogs(September1, September1.AddDays(2));

        var days = json["days"]!.AsArray().Select(day => new
        {
            Date = day!["date"]!.GetValue<string>(),
            MealsCount = day["meals"]!.AsArray().Count
        });
        days.Should().BeEquivalentTo(
            [
                new { Date = "2026-09-01", MealsCount = 0 },
                new { Date = "2026-09-02", MealsCount = 1 },
                new { Date = "2026-09-03", MealsCount = 0 }
            ],
            options => options.WithStrictOrdering());
        ShouldBeJson(json["days"]![0]!["totals"],
            """
            {
              "calories": { "total": 0, "coveredItems": 0, "totalItems": 0 },
              "protein": { "total": 0, "coveredItems": 0, "totalItems": 0 },
              "fats": { "total": 0, "coveredItems": 0, "totalItems": 0 },
              "carbs": { "total": 0, "coveredItems": 0, "totalItems": 0 },
              "sugar": { "total": 0, "coveredItems": 0, "totalItems": 0 },
              "salt": { "total": 0, "coveredItems": 0, "totalItems": 0 }
            }
            """);
    }

    [Fact]
    public async Task DayTotals_ExcludeMissingMacros_ButCountEveryItem()
    {
        GivenNote(September1, MealType.Breakfast, Oatmeal(), quantity: 60);
        GivenNote(September1, MealType.Lunch, Juice(), quantity: 250);

        var json = await GetFoodLogs(September1, September1);

        ShouldBeJson(json["days"]![0]!["totals"],
            """
            {
              "calories": { "total": 331, "coveredItems": 2, "totalItems": 2 },
              "protein": { "total": 7.8, "coveredItems": 1, "totalItems": 2 },
              "fats": { "total": 4.2, "coveredItems": 1, "totalItems": 2 },
              "carbs": { "total": 63.2, "coveredItems": 2, "totalItems": 2 },
              "sugar": { "total": 24.5, "coveredItems": 1, "totalItems": 2 },
              "salt": { "total": 0, "coveredItems": 0, "totalItems": 2 }
            }
            """);
    }

    [Fact]
    public async Task RangeTotals_AverageOverEveryDay_IncludingDaysWithNothingLogged()
    {
        GivenNote(September1, MealType.Breakfast, Oatmeal(), quantity: 60);
        GivenNote(September1.AddDays(2), MealType.Lunch, Juice(), quantity: 250);

        var json = await GetFoodLogs(September1, September1.AddDays(3));

        ShouldBeJson(json["totals"],
            """
            {
              "calories": { "total": 331, "dailyAverage": 82.75, "coveredItems": 2, "totalItems": 2 },
              "protein": { "total": 7.8, "dailyAverage": 1.95, "coveredItems": 1, "totalItems": 2 },
              "fats": { "total": 4.2, "dailyAverage": 1.05, "coveredItems": 1, "totalItems": 2 },
              "carbs": { "total": 63.2, "dailyAverage": 15.8, "coveredItems": 2, "totalItems": 2 },
              "sugar": { "total": 24.5, "dailyAverage": 6.13, "coveredItems": 1, "totalItems": 2 },
              "salt": { "total": 0, "dailyAverage": 0, "coveredItems": 0, "totalItems": 2 }
            }
            """);
    }

    [Fact]
    public async Task ScaledNutrition_IsRoundedHalfAwayFromZero()
    {
        var product = ProductWithoutNutrition(1, "Beans");
        product.Protein = 13.3m;
        GivenNote(September1, MealType.Lunch, product, quantity: 25);

        var json = await GetFoodLogs(September1, September1);

        json["days"]![0]!["meals"]![0]!["items"]![0]!["protein"]!.GetValue<decimal>().Should().Be(3.33m);
    }

    [Fact]
    public async Task RangeOf31Days_IsReturned()
    {
        var json = await GetFoodLogs(September1, new DateOnly(2026, 10, 1));

        json["days"]!.AsArray().Should().HaveCount(31);
    }

    [Fact]
    public async Task RangeOf32Days_IsToolErrorNamingLimitAndRequestedSpan()
    {
        var act = () => GetFoodLogs(September1, new DateOnly(2026, 10, 2));

        await act.Should().ThrowExactlyAsync<McpException>()
            .WithMessage("Requested 32 days; the maximum is 31. Split the range.");
    }

    [Fact]
    public async Task FromAfterTo_IsToolError()
    {
        var act = () => GetFoodLogs(September1.AddDays(1), September1);

        await act.Should().ThrowExactlyAsync<McpException>()
            .WithMessage("`from` 2026-09-02 is after `to` 2026-09-01.");
    }

    private static void ShouldBeJson(JsonNode? actual, string expectedJson)
    {
        var expected = JsonNode.Parse(expectedJson);

        JsonNode.DeepEquals(actual, expected).Should().BeTrue(
            "the actual JSON {0} should equal {1}", actual?.ToJsonString(), expected?.ToJsonString());
    }
}
