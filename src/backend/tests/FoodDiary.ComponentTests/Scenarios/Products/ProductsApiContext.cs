using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Contracts.Products;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsApiContext : CommonSteps
{
    private readonly Dictionary<string, Product> _existingProducts = new();
    
    private ProductsSearchResultDto? _productsResponse;
    private ProductAutocompleteItemDto[]? _productsForAutocompleteResponse;

    public ProductsApiContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }

    public async Task Given_products(params string[] productNames)
    {
        var testCategory = new Category
        {
            Id = 1,
            Name = "Test Category"
        };

        var products = productNames
            .Select((name, index) => new Product
            {
                Id = index + 1,
                Name = name,
                CaloriesCost = 100,
                Category = testCategory
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
        _productsResponse = await Factory.CreateClient().GetFromJsonAsync<ProductsSearchResultDto>("/api/v1/products");
    }
    
    public async Task When_user_searches_products_for_autocomplete()
    {
        _productsForAutocompleteResponse = await Factory.CreateClient()
            .GetFromJsonAsync<ProductAutocompleteItemDto[]>("api/v1/products/autocomplete");
    }
    
    public Task Then_products_list_contains_products_ordered_by_name(params string[] productNames)
    {
        var expected = productNames
            .Select(name => _existingProducts[name])
            .Select(p => new ProductItemDto
            {
                Id = p.Id,
                Name = p.Name,
                CaloriesCost = p.CaloriesCost,
                CategoryId = p.CategoryId,
                CategoryName = p.Category.Name
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
            .Select(p => new ProductAutocompleteItemDto
            {
                Id = p.Id,
                Name = p.Name
            })
            .ToList();

        _productsForAutocompleteResponse.Should().BeEquivalentTo(expected);
        _productsForAutocompleteResponse.Should().BeInAscendingOrder(p => p.Name);
        return Task.CompletedTask;
    }
}