using System.Linq;
using FluentAssertions;
using FoodDiary.Export.GoogleDocs.Builders;
using Google.Apis.Docs.v1.Data;
using Xunit;

namespace FoodDiary.UnitTests.Services.Export;

public class DocumentBuilderTests
{
    [Fact]
    public void Batch_update_requests_are_generated_with_correct_location_indices()
    {
        var documentBuilder = new DocumentBuilder();
        
        documentBuilder.AddHeader("01.05.2022");
        
        var tableBuilder = documentBuilder.StartTable();
        tableBuilder.AddRow(new [] { "Прием пищи", "Продукт/блюдо", "Кол-во (г, мл)", "Ккал", "Общее\nкол-во\nкалорий" });
        tableBuilder.AddRows(new []
        {
            new [] { "Завтрак", "Chicken", "180", "244", "555" },
            new [] { "", "Rice", "90", "117", "" },
            new [] { "", "Bread", "75", "194", "" },
            new [] { "Обед", "Scrambled eggs", "160", "246", "375" },
            new [] { "", "Bread", "50", "129", "" }
        });
        tableBuilder.AddRow(new [] { "Всего за день:", "", "", "", "930" });
        tableBuilder.EndTable();
        
        documentBuilder.AddPageBreak();

        var locationIndices = documentBuilder.GetBatchUpdateRequests()
            .Select(GetLocationIndex)
            .Where(index => index.HasValue)
            .Select(index => index.GetValueOrDefault())
            .ToArray();

        locationIndices.Should().Contain(new []
        {
            1, 11,
            15, 27, 42, 58, 64,
            87, 96, 105, 110, 115,
            /*121,*/ 123, 129, 133, /*138,*/
            /*141,*/ 143, 150, 154, /*159,*/
            162, 168, 184, 189, 194,
            /*200,*/ 202, 209, 213, /*218,*/
            221, /*237, 239, 241,*/ 243,
            248
        });
    }

    private static int? GetLocationIndex(Request request)
    {
        var propertyInRequest = request.GetType()
            .GetProperties()
            .Select(p => p.GetValue(request))
            .First(v => v != null);

        var location = propertyInRequest.GetType()
            .GetProperties()
            .Where(p => p.Name == "Location")
            .Select(p => (Location)p.GetValue(propertyInRequest)!)
            .FirstOrDefault();

        return location?.Index;
    }
}