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
        var googleDriveStorage = _factory.GetFakeGoogleDriveStorage();
        var googleDocsStorage = _factory.GetFakeGoogleDocsStorage();

        var exportRequest = new ExportToGoogleDocsRequestDto
        {
            StartDate = DateTime.Parse("2022-05-01"),
            EndDate = DateTime.Parse("2022-05-11"),
            AccessToken = "test"
        };
        
        var response = await client.PostAsJsonAsync("api/v1/exports/google-docs", exportRequest);
        var exportFile = googleDriveStorage.GetFile(FakeGoogleDocsClient.NewDocId);
        var exportDocument = googleDocsStorage.GetDocument(exportFile?.Id);

        response.IsSuccessStatusCode.Should().BeTrue();
        exportFile.Should().NotBeNull();
        exportDocument.Should().NotBeNull();
        exportDocument!.Title.Should().Be("FoodDiary_20220501_20220511");
        exportDocument.Headers.Should().ContainInOrder("01.05.2022", "02.05.2022", "03.05.2022");
        exportDocument.Tables[0][1].Should().Contain(new[] { "Chicken", "180", "244", "555" });
        exportDocument.Tables[0][2].Should().Contain(new[] { "Rice", "90", "117" });
        exportDocument.Tables[0][3].Should().Contain(new[] { "Bread", "75", "194" });
        exportDocument.Tables[0][4].Should().Contain(new[] { "Scrambled eggs", "160", "246", "375" });
        exportDocument.Tables[0][5].Should().Contain(new[] { "Bread", "50", "129" });
        exportDocument.Tables[0][6].Should().Contain(new[] { "930" });
    }
}