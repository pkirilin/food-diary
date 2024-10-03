using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.WeightTracking;

namespace FoodDiary.ComponentTests.Scenarios.WeightTracking;

public class WeightLogsApiTests(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : ScenarioBase<WeightLogsApiContext>(factory, infrastructure)
{
    protected override WeightLogsApiContext CreateContext(
        FoodDiaryWebApplicationFactory factory,
        InfrastructureFixture infrastructure) => new(factory, infrastructure);

    private static WeightLog[] WeightLogs =>
    [
        new() { Date = DateOnly.Parse("2024-10-01"), Weight = 75.6m },
        new() { Date = DateOnly.Parse("2024-10-02"), Weight = 76.5m },
        new() { Date = DateOnly.Parse("2024-10-03"), Weight = 76.2m },
        new() { Date = DateOnly.Parse("2024-10-04"), Weight = 75.9m }
    ];

    [Scenario]
    public Task I_can_get_weight_logs() => Run(
        c => c.Given_authenticated_user(),
        c => c.Given_existing_weightLogs(WeightLogs),
        c => c.When_user_gets_weightLogs("2024-10-02", "2024-10-03"),
        c => c.Then_response_contains_weightLogs(WeightLogs[2], WeightLogs[1]));

    [Scenario]
    public Task I_can_log_my_weight()
    {
        var newWeightLog = new WeightLog { Date = DateOnly.Parse("2024-10-05"), Weight = 76.3m };
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_existing_weightLogs(WeightLogs),
            c => c.When_user_adds_weightLog(newWeightLog),
            c => c.Then_weight_is_successfully_saved(),
            c => c.When_user_gets_weightLogs("2024-10-03", "2024-10-05"),
            c => c.Then_response_contains_weightLogs(newWeightLog, WeightLogs[3], WeightLogs[2]));
    }
}