using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsApiTests : ScenarioBase
{
    public ProductsApiTests(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task I_can_retrieve_empty_products_list()
    {
        var client = Factory.CreateClient();

        var productsResponse = await client.GetFromJsonAsync<ProductsSearchResultDto>("/api/v1/products");

        productsResponse!.ProductItems.Should().BeEmpty();
        productsResponse.TotalProductsCount.Should().Be(0);
    }
}