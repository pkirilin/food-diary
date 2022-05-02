using System;
using System.Linq;
using System.Net.Http.Json;
using FluentAssertions;
using FoodDiary.Application.Services.Export;
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
        var googleDriveClient = _factory.CreateFakeGoogleDriveClient();

        var exportRequest = new ExportToGoogleDocsRequestDto
        {
            StartDate = DateTime.Parse("2022-05-01"),
            EndDate = DateTime.Parse("2022-05-11"),
            AccessToken = "test"
        };
        
        var response = await client.PostAsJsonAsync("api/v1/exports/google-docs", exportRequest);
        var exportFileOnDrive = googleDriveClient.GetFiles()
            .FirstOrDefault(f => f.Name == "FoodDiary_20220423_20220430");

        response.IsSuccessStatusCode.Should().BeTrue();
        exportFileOnDrive.Should().NotBeNull();
    }
}