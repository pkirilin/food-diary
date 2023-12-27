using System.Net;
using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.API.Requests;
using FoodDiary.Application.Services.Products;
using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Contracts.Products;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsApiContext : BaseContext
{
    private readonly Dictionary<string, Product> _existingProducts = new();
    private Category _testCategory = null!;
    
    private ProductsSearchResultDto? _productsResponse;
    private ProductAutocompleteItemDto[]? _productsForAutocompleteResponse;
    
    private ProductCreateEditRequest _productCreateEditRequest = null!;
    private HttpResponseMessage _createProductResponse = null!;
    private HttpResponseMessage _updateProductResponse = null!;

    public ProductsApiContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }

    public async Task Given_products(params string[] productNames)
    {
        _testCategory = Create.Category("Test Category")
            .WithId(1)
            .Please();
        
        await Factory.SeedDataAsync(new[] { _testCategory });
        
        var products = productNames
            .Select((name, index) => new Product
            {
                Id = index + 1,
                Name = name,
                CaloriesCost = 100,
                DefaultQuantity = 100,
                CategoryId = _testCategory.Id
            })
            .ToList();

        await Factory.SeedDataAsync(products);
        
        foreach (var product in products)
        {
            _existingProducts.Add(product.Name, product);
        }
    }
    
    public async Task When_user_retrieves_products_list()
    {
        _productsResponse = await ApiClient.GetFromJsonAsync<ProductsSearchResultDto>("/api/v1/products");
    }
    
    public async Task When_user_searches_products_for_autocomplete()
    {
        _productsForAutocompleteResponse = await ApiClient
            .GetFromJsonAsync<ProductAutocompleteItemDto[]>("api/v1/products/autocomplete");
    }

    public async Task When_user_creates_product(string productName)
    {
        _testCategory = Create.Category("Test Category")
            .WithId(1)
            .Please();
        
        await Factory.SeedDataAsync(new[] { _testCategory });
        
        _productCreateEditRequest = new ProductCreateEditRequest
        {
            Name = productName,
            CaloriesCost = 123,
            DefaultQuantity = 321,
            CategoryId = _testCategory.Id
        };
        
        _createProductResponse = await ApiClient.PostAsJsonAsync("/api/v1/products", _productCreateEditRequest);
    }

    public async Task When_user_updates_product(string oldProductName, string newProductName)
    {
        var product = _existingProducts[oldProductName];
        
        _productCreateEditRequest = new ProductCreateEditRequest
        {
            Name = newProductName,
            CaloriesCost = 123,
            DefaultQuantity = 321,
            CategoryId = _testCategory.Id
        };
        
        _updateProductResponse = await ApiClient
            .PutAsJsonAsync($"/api/v1/products/{product.Id}", _productCreateEditRequest);
    }
    
    public Task Then_products_list_contains_products_ordered_by_name(params string[] productNames)
    {
        var expected = productNames
            .Select(name => _existingProducts[name])
            .Select(p =>
            {
                p.Category = _testCategory;
                return p.ToProductItemDto();
            })
            .ToList();
        
        _productsResponse!.ProductItems.Should().BeEquivalentTo(expected);
        _productsResponse!.ProductItems.Should().BeInAscendingOrder(p => p.Name);
        return Task.CompletedTask;
    }

    public Task Then_products_for_autocomplete_contain_products_ordered_by_name(params string[] productNames)
    {
        var expected = productNames
            .Select(name => _existingProducts[name])
            .Select(p => p.ToProductAutocompleteItemDto())
            .ToList();
        
        _productsForAutocompleteResponse.Should().BeEquivalentTo(expected);
        _productsForAutocompleteResponse.Should().BeInAscendingOrder(p => p.Name);
        return Task.CompletedTask;
    }

    public Task Then_product_is_successfully_created()
    {
        _createProductResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_products_list_contains_created_product()
    {
        _productsResponse!.ProductItems.Should().ContainEquivalentOf(_productCreateEditRequest);
        return Task.CompletedTask;
    }
    
    public Task Then_product_is_successfully_updated()
    {
        _updateProductResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_products_list_contains_updated_product()
    {
        _productsResponse!.ProductItems.Should().ContainEquivalentOf(_productCreateEditRequest);
        return Task.CompletedTask;
    }
}