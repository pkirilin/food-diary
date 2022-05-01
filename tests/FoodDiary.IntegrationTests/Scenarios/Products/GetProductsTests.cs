using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.Contracts.Products;
using Xunit;

namespace FoodDiary.IntegrationTests.Scenarios.Products;

public class GetProductsTests : IClassFixture<FoodDiaryWebApplicationFactory>
{
    private readonly FoodDiaryWebApplicationFactory _factory;

    public GetProductsTests(FoodDiaryWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Gets_product_autocomplete_items_ordered_by_name()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/v1/products/autocomplete", CancellationToken.None);
        var autocompleteItems = await response.Content.ReadFromJsonAsync<ProductAutocompleteItemDto[]>();
        var products = autocompleteItems?.Select(p => p.Name);
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        products.Should().ContainInOrder("Bread", "Milk");
    }
}