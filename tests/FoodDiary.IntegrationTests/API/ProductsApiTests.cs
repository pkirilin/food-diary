using System.Net;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.Contracts.Products;
using FoodDiary.IntegrationTests.Extensions;
using Xunit;

namespace FoodDiary.IntegrationTests.API;

public class ProductApiTests : IClassFixture<FoodDiaryWebApplicationFactory>
{
    private readonly FoodDiaryWebApplicationFactory _webApplicationFactory;

    public ProductApiTests(FoodDiaryWebApplicationFactory webApplicationFactory)
    {
        _webApplicationFactory = webApplicationFactory;
    }

    [Fact]
    public async Task Gets_product_autocomplete_items_ordered_by_name()
    {
        await _webApplicationFactory.PrepareDatabase()
            .AddProduct(1, "Milk")
            .AddProduct(2, "Bread")
            .SeedAsync();
        
        var client = _webApplicationFactory.CreateClient();
        
        var response = await client.GetAsync("/api/v1/products/autocomplete", CancellationToken.None);
        var productsForAutocomplete = await response.Content.ReadFromJsonAsync<ProductAutocompleteItemDto[]>();
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        productsForAutocomplete.Should().HaveCount(2);
        productsForAutocomplete.Should().Contain(p => p.Name == "Bread");
        productsForAutocomplete.Should().Contain(p => p.Name == "Milk");
        productsForAutocomplete.Should().BeInAscendingOrder(p => p.Name);
    }
}