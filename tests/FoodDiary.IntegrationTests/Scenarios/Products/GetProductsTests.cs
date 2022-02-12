using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.Contracts.Products;
using Xunit;

namespace FoodDiary.IntegrationTests.Scenarios.Products;

public class GetProductsTests : IClassFixture<FoodDiaryWebApplicationFactory>
{
    private readonly FoodDiaryWebApplicationFactory _webApplicationFactory;
    private readonly HttpClient _client;

    public GetProductsTests(FoodDiaryWebApplicationFactory webApplicationFactory)
    {
        _webApplicationFactory = webApplicationFactory;
        _client = _webApplicationFactory.CreateClient();
    }
    
    [Fact]
    public async Task Gets_product_autocomplete_items_ordered_by_name()
    {
        await _webApplicationFactory.SeedDatabase()
            .AddProduct(1, "Milk")
            .AddProduct(2, "Bread")
            .PleaseAsync();

        var response = await _client.GetAsync("/api/v1/products/autocomplete", CancellationToken.None);
        var productsForAutocomplete = await response.Content.ReadFromJsonAsync<ProductAutocompleteItemDto[]>();
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        productsForAutocomplete.Should().HaveCount(2)
            .And.Contain(p => p.Name == "Milk")
            .And.Contain(p => p.Name == "Bread")
            .And.BeInAscendingOrder(p => p.Name);
    }
}