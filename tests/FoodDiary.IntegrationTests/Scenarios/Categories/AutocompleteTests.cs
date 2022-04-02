using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.API.Dtos;
using FoodDiary.Contracts.Categories;
using Xunit;

namespace FoodDiary.IntegrationTests.Scenarios.Categories;

public class AutocompleteTests : IClassFixture<FoodDiaryWebApplicationFactory>, IDisposable
{
    private readonly FoodDiaryWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AutocompleteTests(FoodDiaryWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    public void Dispose()
    {
        _factory.ClearDatabase();
    }

    [Fact]
    public async Task Gets_category_autocomplete_items_ordered_by_name()
    {
        await _factory.SeedDatabase()
            .AddCategory("Cereals")
            .AddCategory("Dairy")
            .AddCategory("Frozen Foods")
            .AddCategory("Bakery")
            .PleaseAsync();
        
        var response = await _client.GetAsync("/api/v1/products/autocomplete", CancellationToken.None);
        var autocompleteItems = await response.Content.ReadFromJsonAsync<CategoryAutocompleteItemDto[]>();
        var categories = autocompleteItems?.Select(item => item.Name).ToArray();

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        categories.Should().ContainInOrder("Bakery", "Cereals", "Dairy", "Frozen Foods");
    }
}