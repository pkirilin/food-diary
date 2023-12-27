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

    public async Task Given_products(params string[] products)
    {
        _testCategory = Create.Category("Test Category")
            .WithId(1)
            .Please();
        
        await Factory.SeedDataAsync(new[] { _testCategory });

        var productsList = products
            .Select(name => Create.Product(name)
                .WithCategoryId(_testCategory.Id)
                .Please())
            .ToList();

        await Factory.SeedDataAsync(productsList);
        
        foreach (var product in productsList)
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

    public async Task When_user_creates_product(string product)
    {
        _testCategory = Create.Category("Test Category")
            .WithId(1)
            .Please();
        
        await Factory.SeedDataAsync(new[] { _testCategory });
        
        _productCreateEditRequest = new ProductCreateEditRequest
        {
            Name = product,
            CaloriesCost = 123,
            DefaultQuantity = 321,
            CategoryId = _testCategory.Id
        };
        
        _createProductResponse = await ApiClient.PostAsJsonAsync("/api/v1/products", _productCreateEditRequest);
    }

    public async Task When_user_updates_product_from_NAME_to_NEWNAME(string name, string newName)
    {
        var product = _existingProducts[name];
        
        _productCreateEditRequest = new ProductCreateEditRequest
        {
            Name = newName,
            CaloriesCost = 123,
            DefaultQuantity = 321,
            CategoryId = _testCategory.Id
        };
        
        _updateProductResponse = await ApiClient
            .PutAsJsonAsync($"/api/v1/products/{product.Id}", _productCreateEditRequest);
    }
    
    public Task Then_products_list_contains_items_ordered_by_name(params string[] items)
    {
        var expected = items
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

    public Task Then_products_for_autocomplete_contain_items_ordered_by_name(params string[] items)
    {
        var expected = items
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