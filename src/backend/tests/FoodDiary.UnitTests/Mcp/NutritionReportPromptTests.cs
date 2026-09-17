using FoodDiary.API.Mcp.Prompts;

namespace FoodDiary.UnitTests.Mcp;

public class NutritionReportPromptTests
{
    [Fact]
    public void Period_IsTheReportedPeriod()
    {
        FirstLine(NutritionReportPrompt.NutritionReport("2026-09-01 to 2026-09-07"))
            .Should().Be("Write a nutrition report for this period: 2026-09-01 to 2026-09-07");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void EmptyPeriod_DefaultsToLast7Days(string? period)
    {
        FirstLine(NutritionReportPrompt.NutritionReport(period))
            .Should().Be("Write a nutrition report for this period: the last 7 days");
    }

    [Fact]
    public void MealTokens_MatchGetFoodLogs()
    {
        NutritionReportPrompt.NutritionReport()
            .Should().Contain("Breakfast, SecondBreakfast, Lunch, AfternoonSnack, Dinner");
    }

    private static string FirstLine(string text) => text.Split('\n')[0].TrimEnd('\r');
}
