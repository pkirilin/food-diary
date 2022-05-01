using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.Contracts.Categories;
using Xunit;

namespace FoodDiary.IntegrationTests.Scenarios.Categories;

public class AutocompleteTests : IClassFixture<FoodDiaryWebApplicationFactory>
{
    private readonly FoodDiaryWebApplicationFactory _factory;

    public AutocompleteTests(FoodDiaryWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Gets_category_autocomplete_items_ordered_by_name()
    {
        var client = _factory.CreateClient();
        
        await _factory.SeedDatabase()
            .AddCategory("Cereals")
            .AddCategory("Dairy")
            .AddCategory("Frozen Foods")
            .AddCategory("Bakery")
            .PleaseAsync();
        
        var response = await client.GetAsync("/api/v1/categories/autocomplete", CancellationToken.None);
        var autocompleteItems = await response.Content.ReadFromJsonAsync<CategoryAutocompleteItemDto[]>();
        var categories = autocompleteItems?.Select(item => item.Name).ToArray();

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        categories.Should().ContainInOrder("Bakery", "Cereals", "Dairy", "Frozen Foods");
    }
}