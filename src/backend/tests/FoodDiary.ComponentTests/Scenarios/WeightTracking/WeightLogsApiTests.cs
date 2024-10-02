using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.WeightTracking;

namespace FoodDiary.ComponentTests.Scenarios.WeightTracking;

public class WeightLogsApiTests(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : ScenarioBase<WeightLogsApiContext>(factory, infrastructure)
{
    protected override WeightLogsApiContext CreateContext(
        FoodDiaryWebApplicationFactory factory,
        InfrastructureFixture infrastructure) => new(factory, infrastructure);
    
    [Scenario]
    public Task I_can_get_weight_logs()
    {
        var weightLogs = new WeightLog[]
        {
            new() { Date = DateOnly.Parse("2024-10-01"), Weight = 75.6m },
            new() { Date = DateOnly.Parse("2024-10-02"), Weight = 76.5m },
            new() { Date = DateOnly.Parse("2024-10-03"), Weight = 76.2m },
            new() { Date = DateOnly.Parse("2024-10-04"), Weight = 75.9m }
        };
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_existing_weightLogs(weightLogs),
            c => c.When_user_gets_weightLogs("2024-10-02", "2024-10-03"),
            c => c.Then_response_contains_weightLogs(weightLogs[2], weightLogs[1]));
    }
    
    // [Scenario]
    // public Task I_can_add_weight_log()
    // {
    //     return Run(
    //         c => c.When_user_adds_weight_log(),
    //         c => c.Then_weight_log_is_successfully_created(),
    //         c => c.When_user_gets_weight_logs(),
    //         c => c.Then_weight_logs_list_contains([]));
    // }
}