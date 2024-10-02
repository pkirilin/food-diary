using System.Net.Http.Json;
using FoodDiary.API.Features.WeightTracking;
using FoodDiary.API.Features.WeightTracking.Contracts;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.WeightTracking;

namespace FoodDiary.ComponentTests.Scenarios.WeightTracking;

public class WeightLogsApiContext(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : BaseContext(factory, infrastructure)
{
    private GetWeightLogsResponse? _getWeightLogsResponse;

    public Task Given_existing_weightLogs(params WeightLog[] weightLogs)
    {
        return Factory.SeedDataAsync(weightLogs);
    }
    
    public async Task When_user_gets_weightLogs(string from, string to)
    {
        _getWeightLogsResponse = await ApiClient
            .GetFromJsonAsync<GetWeightLogsResponse>($"api/weight-logs?from={from}&to={to}");
    }

    public Task Then_response_contains_weightLogs(params WeightLog[] items)
    {
        _getWeightLogsResponse?.WeightLogs.Should()
            .ContainInOrder(items.Select(wl => wl.ToWeightLogItem()))
            .And.HaveSameCount(items);
        return Task.CompletedTask;
    }
}