using System;
using System.Net.Http.Json;
using FluentAssertions;
using FoodDiary.Application.Services.Export;
using FoodDiary.IntegrationTests.Fakes;
using Xunit;

namespace FoodDiary.IntegrationTests.Scenarios.Export;

public class ExportTests : IClassFixture<FoodDiaryWebApplicationFactory>
{
    private readonly FoodDiaryWebApplicationFactory _factory;

    public ExportTests(FoodDiaryWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async void Data_is_saved_to_google_drive_as_google_doc()
    {
        var client = _factory.CreateClient();

        var exportRequest = new ExportToGoogleDocsRequestDto
        {
            StartDate = DateTime.Parse("2022-05-01"),
            EndDate = DateTime.Parse("2022-05-11"),
            AccessToken = "test"
        };
        
        var response = await client.PostAsJsonAsync("api/v1/exports/google-docs", exportRequest);
        var exportResponse = await response.Content.ReadFromJsonAsync<ExportToGoogleDocsResponseDto>();

        response.IsSuccessStatusCode.Should().BeTrue();
        exportResponse.Should().NotBeNull();
        exportResponse!.DocumentId.Should().Be(FakeGoogleDocsClient.NewDocId);
    }
    
    [Fact]
    public async void Data_is_exported_to_json()
    {
        var client = _factory.CreateClient();
        const string url = "api/v1/exports/json-new?startDate=2022-05-01&endDate=2022-05-11";

        var response = await client.GetAsync(url);
        var content = await response.Content.ReadAsByteArrayAsync();

        response.IsSuccessStatusCode.Should().BeTrue();
        content.Should().NotBeNull().And.NotBeEmpty();
    }
}