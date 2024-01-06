using System.Net.Http.Json;
using FoodDiary.Application.Services.Export;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Export;

public class ExportApiContext : BaseContext
{
    private HttpResponseMessage _exportJsonResponse = null!;
    private JsonExportFileDto? _exportJsonData;
    
    public ExportApiContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }

    public Task Given_pages(params Page[] pages)
    {
        return Factory.SeedDataAsync(pages);
    }
    
    public async Task When_user_exports_data_to_json_file(string startDate, string endDate)
    {
        _exportJsonResponse = await ApiClient.GetAsync($"/api/v1/exports/json?startDate={startDate}&endDate={endDate}");
    }

    public async Task Then_json_export_is_successful()
    {
        _exportJsonResponse.IsSuccessStatusCode.Should().BeTrue();
        _exportJsonData = await _exportJsonResponse.Content.ReadFromJsonAsync<JsonExportFileDto>();
    }

    public Task Then_json_file_contains_pages(params Page[] pages)
    {
        var expectedJsonData = new JsonExportFileDto
        {
            Pages = pages.Select(p => p.ToJsonExportPageDto())
        };
        
        _exportJsonData?.Should().BeEquivalentTo(expectedJsonData);
        
        return Task.CompletedTask;
    }
}