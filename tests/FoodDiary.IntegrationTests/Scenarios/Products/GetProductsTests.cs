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
        
        await _factory.SeedDatabase()
            .AddProduct(1, "Milk")
            .AddProduct(2, "Bread")
            .PleaseAsync();

        var response = await client.GetAsync("/api/v1/products/autocomplete", CancellationToken.None);
        var productsForAutocomplete = await response.Content.ReadFromJsonAsync<ProductAutocompleteItemDto[]>();
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        productsForAutocomplete.Should().HaveCount(2)
            .And.Contain(p => p.Name == "Milk")
            .And.Contain(p => p.Name == "Bread")
            .And.BeInAscendingOrder(p => p.Name);
    }
}