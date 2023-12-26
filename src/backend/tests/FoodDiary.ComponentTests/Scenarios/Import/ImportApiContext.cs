using System.Globalization;
using System.Net;
using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Import;

public class ImportApiContext : BaseContext
{
    private string _importFilePath = string.Empty;

    private HttpResponseMessage _importJsonResponse = null!;
    private int _createdPageId;
    
    public ImportApiContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }

    public Task Given_json_import_file(string fileName)
    {
        _importFilePath = Path.Combine("Scenarios", "Import", fileName);
        return Task.CompletedTask;
    }

    public async Task When_user_imports_data_from_json_file()
    {
        await using var stream = File.OpenRead(_importFilePath);
        using var content = new MultipartFormDataContent();
        content.Add(new StreamContent(stream), "importFile", "importFile");
        
        var request = new HttpRequestMessage
        {
            Method = HttpMethod.Post,
            RequestUri = new Uri("/api/v1/imports/json", UriKind.Relative),
            Content = content
        };
            
        _importJsonResponse = await ApiClient.SendAsync(request);
    }

    public Task Then_json_import_is_successful()
    {
        _importJsonResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }

    public async Task Then_pages_list_contains(Page item)
    {
        var pagesListResult = await ApiClient.GetFromJsonAsync<PagesSearchResultDto>("/api/v1/pages");
        var expectedDate = item.Date.ToString("s", CultureInfo.InvariantCulture)[..10];
        var createdPage = pagesListResult?.PageItems.FirstOrDefault(p => p.Date == expectedDate);
        
        createdPage.Should().NotBeNull();
        _createdPageId = createdPage!.Id;
    }
    
    public async Task Then_notes_list_contains(params Note[] items)
    {
        var notesList = await ApiClient.GetFromJsonAsync<List<NoteItemDto>>($"/api/v1/notes?pageId={_createdPageId}");

        items.ToList().ForEach(expected =>
        {
            notesList.Should().Contain(actual =>
                actual.MealType == expected.MealType &&
                actual.ProductName == expected.Product.Name &&
                actual.ProductQuantity == expected.ProductQuantity &&
                // actual.ProductDefaultQuantity == expected.Product.DefaultQuantity &&
                actual.DisplayOrder == expected.DisplayOrder &&
                actual.Calories > 0);
        });
    }
    
    public async Task Then_products_list_contains(params Product[] items)
    {
        var productsListResult = await ApiClient.GetFromJsonAsync<ProductsSearchResultDto>("/api/v1/products");
        
        items.ToList().ForEach(expected =>
        {
            productsListResult?.ProductItems.Should().Contain(actual =>
                actual.Name == expected.Name &&
                actual.CaloriesCost == expected.CaloriesCost &&
                // actual.DefaultQuantity == expected.DefaultQuantity &&
                actual.CategoryName == expected.Category.Name);
        });
    }
    
    public async Task Then_categories_list_contains(params Category[] items)
    {
        var categoriesList = await ApiClient.GetFromJsonAsync<List<CategoryItemDto>>("/api/v1/categories");
        
        items.ToList().ForEach(expected =>
        {
            categoriesList.Should().Contain(actual => actual.Name == expected.Name);
        });
    }
}