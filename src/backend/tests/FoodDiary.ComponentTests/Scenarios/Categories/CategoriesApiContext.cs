using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.Application.Services.Categories;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Contracts.Categories;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Categories;

public class CategoriesApiContext : BaseContext
{
    private IReadOnlyList<CategoryItemDto>? _categoriesList;
    private IReadOnlyList<CategoryAutocompleteItemDto>? _categoriesListForAutocomplete;
    
    public CategoriesApiContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }

    public Task Given_categories(params Category[] categories)
    {
        return Factory.SeedDataAsync(categories);
    }

    public async Task When_user_retrieves_categories_list()
    {
        _categoriesList = await ApiClient.GetFromJsonAsync<IReadOnlyList<CategoryItemDto>>("/api/v1/categories");
    }
    
    public async Task When_user_searches_categories_for_autocomplete()
    {
        _categoriesListForAutocomplete = await ApiClient
            .GetFromJsonAsync<IReadOnlyList<CategoryAutocompleteItemDto>>("/api/v1/categories/autocomplete");
    }

    public Task Then_categories_list_contains_items(params Category[] items)
    {
        var expectedCategoriesList = items.Select(c => c.ToCategoryItemDto());
        
        _categoriesList?.Should()
            .BeEquivalentTo(expectedCategoriesList, options => options.Excluding(category => category.Id))
            .And.BeInAscendingOrder(c => c.Name);
        
        return Task.CompletedTask;
    }

    public Task Then_categories_list_for_autocomplete_contains_items(params Category[] items)
    {
        var expectedCategoriesList = items.Select(c => c.ToCategoryAutocompleteItemDto());
        
        _categoriesListForAutocomplete?.Should()
            .BeEquivalentTo(expectedCategoriesList, options => options.Excluding(category => category.Id))
            .And.BeInAscendingOrder(c => c.Name);
        
        return Task.CompletedTask;
    }
}