using System;
using System.Linq;
using FluentAssertions;
using FoodDiary.Contracts.Export;
using Xunit;

namespace FoodDiary.IntegrationTests.Scenarios.Export;

public class ExportDataLoaderTests : IClassFixture<ComponentTestFixture>
{
    private readonly ComponentTestFixture _fixture;

    public ExportDataLoaderTests(ComponentTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async void Pages_are_loaded_and_transformed_to_export_data()
    {
        var exportDataLoader = _fixture.CreateExportDataLoader();
        var startDate = DateTime.Parse("2022-05-01");
        var endDate = DateTime.Parse("2022-05-11");

        var exportFileDto = await exportDataLoader.GetExportDataAsync(startDate, endDate, default);
        var exportedDates = exportFileDto.Pages.Select(p => p.FormattedDate);
        var exportedNotes = exportFileDto.Pages.SelectMany(p => p.NoteGroups).SelectMany(ng => ng.Notes);
        var exportedNoteGroupsTotalCalories = exportFileDto.Pages.SelectMany(p => p.NoteGroups).Select(ng => ng.TotalCalories);
        var exportedPagesTotalCalories = exportFileDto.Pages.Select(p => p.TotalCalories);

        exportFileDto.FileName.Should().Be("FoodDiary_20220501_20220511");
        exportedDates.Should().ContainInOrder("01.05.2022", "02.05.2022", "03.05.2022");
        exportedNoteGroupsTotalCalories.Should().ContainInOrder(555, 375);
        exportedPagesTotalCalories.Should().Contain(930);
        exportedNotes.Should().BeEquivalentTo(new ExportNoteDto[]
        {
            new() { ProductName = "Chicken", ProductQuantity = 180, Calories = 244 },
            new() { ProductName = "Rice", ProductQuantity = 90, Calories = 117 },
            new() { ProductName = "Bread", ProductQuantity = 75, Calories = 194 },
            new() { ProductName = "Scrambled eggs", ProductQuantity = 160, Calories = 246 },
            new() { ProductName = "Bread", ProductQuantity = 50, Calories = 129 },
        });
    }
}