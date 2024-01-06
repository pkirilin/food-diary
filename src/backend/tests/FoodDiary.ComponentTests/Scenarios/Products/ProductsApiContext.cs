using System.Net;
using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.Application.Services.Products;
using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Contracts.Products;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsApiContext : BaseContext
{
    private ProductsSearchResultDto? _productsResponse;
    private ProductAutocompleteItemDto[]? _productsForAutocompleteResponse;
    private HttpResponseMessage _createProductResponse = null!;
    private HttpResponseMessage _updateProductResponse = null!;

    public ProductsApiContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }

    public Task Given_products(params Product[] products)
    {
        return Factory.SeedDataAsync(products);
    }
    
    public Task Given_categories(params Category[] categories)
    {
        return Factory.SeedDataAsync(categories);
    }
    
    public async Task When_user_retrieves_products_list()
    {
        _productsResponse = await ApiClient.GetFromJsonAsync<ProductsSearchResultDto>("/api/v1/products");
    }

    public async Task When_user_searches_products_by_name(string name)
    {
        _productsResponse = await ApiClient
            .GetFromJsonAsync<ProductsSearchResultDto>($"/api/v1/products?productSearchName={name}");
    }
    
    public async Task When_user_searches_products_for_autocomplete()
    {
        _productsForAutocompleteResponse = await ApiClient
            .GetFromJsonAsync<ProductAutocompleteItemDto[]>("api/v1/products/autocomplete");
    }

    public async Task When_user_creates_product(Product product)
    {
        var request = Create.ProductCreateEditRequest()
            .From(product)
            .Please();
        
        _createProductResponse = await ApiClient.PostAsJsonAsync("/api/v1/products", request);
    }

    public async Task When_user_renames_product(Product product, string newName)
    {
        var request = Create.ProductCreateEditRequest()
            .From(product)
            .WithName(newName)
            .Please();
        
        _updateProductResponse = await ApiClient.PutAsJsonAsync($"/api/v1/products/{product.Id}", request);
    }
    
    public Task Then_products_list_contains_items(params Product[] items)
    {
        var expectedProductsList = items.Select(p => p.ToProductItemDto());
        
        _productsResponse?.ProductItems.Should()
            .BeEquivalentTo(expectedProductsList, options => options
                .Excluding(p => p.Id)
                .Excluding(p => p.CategoryId))
            .And.BeInAscendingOrder(p => p.Name);
        
        return Task.CompletedTask;
    }
    
    public Task Then_products_list_for_autocomplete_contains_items(params Product[] items)
    {
        var expectedProductsList = items.Select(p => p.ToProductAutocompleteItemDto());

        _productsForAutocompleteResponse.Should()
            .BeEquivalentTo(expectedProductsList, options => options.Excluding(p => p.Id))
            .And.BeInAscendingOrder(p => p.Name);
        
        return Task.CompletedTask;
    }

    public Task Then_product_is_successfully_created()
    {
        _createProductResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_product_is_successfully_updated()
    {
        _updateProductResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
}