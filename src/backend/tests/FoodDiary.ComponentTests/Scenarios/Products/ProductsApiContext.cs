using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Features.Products.Contracts;
using FoodDiary.API.Features.Products.Extensions;
using FoodDiary.API.Mapping;
using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.DateAndTime;
using FoodDiary.Contracts.Products;
using FoodDiary.Domain.Entities;
using JetBrains.Annotations;

namespace FoodDiary.ComponentTests.Scenarios.Products;

[UsedImplicitly]
public class ProductsApiContext(FoodDiaryWebApplicationFactory factory) : BaseContext(factory)
{
    private ProductsSearchResultDto? _productsResponse;
    private SearchProductsResponse.Product[]? _productsForAutocompleteResponse;
    private HttpResponseMessage _getProductByIdResponse = null!;
    private CreateProductResponse? _createProductResponse;
    private HttpResponseMessage _updateProductResponse = null!;
    private HttpResponseMessage _deleteProductResponse = null!;
    private HttpResponseMessage _deleteMultipleProductsResponse = null!;
    
    private readonly ProductsCatalog _products = new();
    
    public Task Given_products(params Product[] products)
    {
        return Factory.SeedDataAsync(products);
    }
    
    public async Task Given_product(string product)
    {
        await Factory.SeedDataAsync([_products.TryGetOrAdd(product, out _)]);
    }

    private async Task Given_product_logged_on(string productName, DateOnly loggedOn)
    {
        var product = _products.TryGetOrAdd(productName, out var isNewProduct);

        if (isNewProduct)
        {
            await Factory.SeedDataAsync([product]);
        }
        
        await Factory.SeedDataAsync([
            Create.Note()
                .WithDate(loggedOn)
                .WithExistingProduct(product)
                .Please()
        ]);
    }

    public Task Given_product_logged_yesterday(string product) =>
        Given_product_logged_on(product, FakeDateTimeProvider.Yesterday());

    public Task Given_product_logged_today(string product) =>
        Given_product_logged_on(product, FakeDateTimeProvider.Today());
    
    public Task Given_categories(params Domain.Entities.Category[] categories)
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
            .GetFromJsonAsync<SearchProductsResponse.Product[]>("api/v1/products/autocomplete");
    }

    public async Task When_user_creates_product(Product product)
    {
        var request = Create.ProductCreateEditRequest()
            .From(product)
            .Please();
        
        var response = await ApiClient.PostAsJsonAsync("/api/v1/products", request);
        _createProductResponse = await response.Content.ReadFromJsonAsync<CreateProductResponse>();
    }

    public async Task When_user_renames_product(Product product, string newName)
    {
        var request = Create.ProductCreateEditRequest()
            .From(product)
            .WithName(newName)
            .Please();
        
        _updateProductResponse = await ApiClient.PutAsJsonAsync($"/api/v1/products/{product.Id}", request);
    }

    public async Task When_user_deletes_product(Product product)
    {
        _deleteProductResponse = await ApiClient.DeleteAsync($"/api/v1/products/{product.Id}");
    }
    
    public async Task When_user_deletes_products(params Product[] products)
    {
        var productIds = products.Select(p => p.Id);

        var request = new HttpRequestMessage(HttpMethod.Delete, "api/v1/products/batch")
        {
            Content = new StringContent(JsonSerializer.Serialize(productIds), Encoding.Unicode, "application/json")
        };
        
        _deleteMultipleProductsResponse = await ApiClient.SendAsync(request);
    }
    
    public async Task When_user_retrieves_product_by_id(int id)
    {
        _getProductByIdResponse = await ApiClient.GetAsync($"/api/v1/products/{id}");
    }
    
    public Task When_user_retrieves_created_product_by_id()
        => When_user_retrieves_product_by_id(_createProductResponse?.Id ?? 0);
    
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

    public Task Then_products_list_is_empty()
    {
        _productsResponse?.ProductItems.Should().BeEmpty();
        return Task.CompletedTask;
    }
    
    public Task Then_products_list_for_autocomplete_contains_items(params string[] items)
    {
        _productsForAutocompleteResponse?.Select(p => p.Name)
            .Should().ContainInOrder(items)
            .And.HaveSameCount(items);
        
        return Task.CompletedTask;
    }

    public Task Then_product_is_successfully_created()
    {
        _createProductResponse.Should().NotBeNull();
        _createProductResponse?.Id.Should().BePositive();
        return Task.CompletedTask;
    }
    
    public Task Then_product_is_successfully_updated()
    {
        _updateProductResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_product_is_successfully_deleted()
    {
        _deleteProductResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_multiple_products_are_successfully_deleted()
    {
        _deleteMultipleProductsResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }

    public async Task Then_product_is_successfully_retrieved(Product product)
    {
        _getProductByIdResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var response = await _getProductByIdResponse.Content.ReadFromJsonAsync<GetProductByIdResponse>();
        
        response.Should()
            .BeEquivalentTo(product.ToGetProductByIdResponse(), options => options
                .Excluding(p => p.Id)
                .Excluding(p => p.Category.Id));
    }
}