using System.Net;
using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.API.Requests;
using FoodDiary.Application.Services.Categories;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Contracts.Categories;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Categories;

public class CategoriesApiContext(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : BaseContext(factory, infrastructure)
{
    private IReadOnlyList<CategoryItemDto>? _categoriesList;
    private IReadOnlyList<CategoryAutocompleteItemDto>? _categoriesListForAutocomplete;
    private HttpResponseMessage _createCategoryResponse = null!;
    private HttpResponseMessage _updateCategoryResponse = null!;
    private HttpResponseMessage _deleteCategoryResponse = null!;

    public Task Given_categories(params Category[] categories)
    {
        return Factory.SeedDataAsync(categories);
    }

    public async Task When_user_retrieves_categories_list()
    {
        _categoriesList = await ApiClient.GetFromJsonAsync<IReadOnlyList<CategoryItemDto>>("/api/v1/categories");
    }

    public async Task When_user_creates_category(string category)
    {
        var request = new CategoryCreateEditRequest { Name = category };
        _createCategoryResponse = await ApiClient.PostAsJsonAsync("/api/v1/categories", request);
    }

    public async Task When_user_renames_category(Category category, string newName)
    {
        var request = new CategoryCreateEditRequest { Name = newName };
        _updateCategoryResponse = await ApiClient.PutAsJsonAsync($"/api/v1/categories/{category.Id}", request);
    }

    public async Task When_user_deletes_category(Category category)
    {
        _deleteCategoryResponse = await ApiClient.DeleteAsync($"/api/v1/categories/{category.Id}");
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

    public Task Then_categories_list_is_empty()
    {
        _categoriesList?.Should().BeEmpty();
        return Task.CompletedTask;
    }

    public Task Then_category_is_successfully_created()
    {
        _createCategoryResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_category_is_successfully_updated()
    {
        _updateCategoryResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_category_is_successfully_deleted()
    {
        _deleteCategoryResponse.StatusCode.Should().Be(HttpStatusCode.OK);
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