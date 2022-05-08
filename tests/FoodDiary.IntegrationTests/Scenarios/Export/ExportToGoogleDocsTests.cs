using System;
using System.Net.Http.Json;
using FluentAssertions;
using FoodDiary.Application.Services.Export;
using FoodDiary.IntegrationTests.Fakes;
using Xunit;

namespace FoodDiary.IntegrationTests.Scenarios.Export;

public class ExportToGoogleDocsTests : IClassFixture<FoodDiaryWebApplicationFactory>
{
    private readonly FoodDiaryWebApplicationFactory _factory;

    public ExportToGoogleDocsTests(FoodDiaryWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async void Export_data_is_saved_to_google_drive_folder_as_google_doc()
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
}