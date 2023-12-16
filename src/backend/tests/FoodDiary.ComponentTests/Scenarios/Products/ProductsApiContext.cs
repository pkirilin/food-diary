using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsApiContext
{
    private readonly FoodDiaryWebApplicationFactory _factory;

    private ProductsSearchResultDto? _productsResponse;

    public ProductsApiContext(FoodDiaryWebApplicationFactory factory)
    {
        _factory = factory;
    }
    
    public async Task When_user_retrieves_products_list()
    {
        var client = _factory.CreateClient();
        _productsResponse = await client.GetFromJsonAsync<ProductsSearchResultDto>("/api/v1/products");
    }
    
    public Task Then_products_list_is_empty()
    {
        _productsResponse!.ProductItems.Should().BeEmpty();
        _productsResponse.TotalProductsCount.Should().Be(0);
        return Task.CompletedTask;
    }
}