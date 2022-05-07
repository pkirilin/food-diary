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
    public async void Export_data_is_loaded_and_calculated()
    {
        var exportDataLoader = _fixture.CreateExportDataLoader();
        var startDate = DateTime.Parse("2022-05-01");
        var endDate = DateTime.Parse("2022-05-11");

        var exportFileDto = await exportDataLoader.LoadAsync(startDate, endDate, default);

        exportFileDto.FileName.Should().Be("FoodDiary_20220501_20220511");
        exportFileDto.Pages.Select(p => p.FormattedDate).Should().ContainInOrder("01.05.2022", "02.05.2022", "03.05.2022");
        exportFileDto.Pages.SelectMany(p => p.NoteGroups).SelectMany(ng => ng.Notes).Should().BeEquivalentTo(new ExportNoteDto[]
        {
            new() { ProductName = "Chicken", ProductQuantity = 180, Calories = 244 },
            new() { ProductName = "Rice", ProductQuantity = 90, Calories = 117 },
            new() { ProductName = "Bread", ProductQuantity = 75, Calories = 194 },
            new() { ProductName = "Scrambled eggs", ProductQuantity = 160, Calories = 246 },
            new() { ProductName = "Bread", ProductQuantity = 50, Calories = 129 },
        });
        exportFileDto.Pages.SelectMany(p => p.NoteGroups).Select(ng => ng.TotalCalories).Should().ContainInOrder(555, 375);
        exportFileDto.Pages.Select(p => p.TotalCalories).Should().Contain(930);
    }
}