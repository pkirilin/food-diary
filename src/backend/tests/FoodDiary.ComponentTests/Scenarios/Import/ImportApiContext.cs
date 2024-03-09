using System.Net;
using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Import;

public class ImportApiContext(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : BaseContext(factory, infrastructure)
{
    private HttpResponseMessage _importJsonResponse = null!;
    private int _createdPageId;

    public Task Given_categories(params Category[] categories)
    {
        return Factory.SeedDataAsync(categories);
    }
    
    public Task Given_products(params Product[] products)
    {
        var productsToCreate = products.Select(p => Create.Product()
            .From(p)
            .WithExistingCategory(p.Category)
            .Please());
        
        return Factory.SeedDataAsync(productsToCreate);
    }
    
    public Task Given_notes(params Note[] notes)
    {
        var notesToCreate = notes.Select(n => Create.Note()
            .From(n)
            .WithExistingPage(n.Page)
            .WithExistingProduct(n.Product)
            .Please());
        
        return Factory.SeedDataAsync(notesToCreate);
    }
    
    public Task Given_pages(params Page[] pages)
    {
        return Factory.SeedDataAsync(pages);
    }

    public async Task When_user_imports_data_from_json_file(string file)
    {
        var importFilePath = Path.Combine("Scenarios", "Import", file);
        
        await using var stream = File.OpenRead(importFilePath);
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

    public async Task Then_pages_list_contains_items(params Page[] items)
    {
        var pagesListResult = await ApiClient.GetFromJsonAsync<PagesSearchResultDto>("/api/v1/pages");
        var expectedPageDates = items.Select(p => p.Date).ToList();
        
        var createdPage = pagesListResult?.PageItems.FirstOrDefault(p => p.Date == expectedPageDates.FirstOrDefault());
        createdPage.Should().NotBeNull();
        _createdPageId = createdPage!.Id;

        pagesListResult?.PageItems
            .Select(p => p.Date)
            .Should()
            .BeEquivalentTo(expectedPageDates);
    }
    
    public async Task Then_notes_list_contains_items(params Note[] items)
    {
        var notesList = await ApiClient.GetFromJsonAsync<List<NoteItemDto>>($"/api/v1/notes?pageId={_createdPageId}");
        var expectedNotesList = items.Select(n => n.ToNoteItemDto());

        notesList.Should()
            .BeEquivalentTo(expectedNotesList, options => options
                .Excluding(note => note.Id)
                .Excluding(note => note.PageId)
                .Excluding(note => note.ProductId)
                .Excluding(note => note.Calories))
            .And.AllSatisfy(note => { note.Calories.Should().BePositive(); });
    }
    
    public async Task Then_products_list_contains_items(params Product[] items)
    {
        var productsListResult = await ApiClient.GetFromJsonAsync<ProductsSearchResultDto>("/api/v1/products");
        var productsList = productsListResult?.ProductItems ?? Array.Empty<ProductItemDto>();
        var expectedProductsList = items.Select(p => p.ToProductItemDto());

        productsList.Should()
            .BeEquivalentTo(expectedProductsList, options => options
                .Excluding(product => product.Id)
                .Excluding(product => product.CategoryId));
    }
    
    public async Task Then_categories_list_contains_items(params Category[] items)
    {
        var categoriesList = await ApiClient.GetFromJsonAsync<List<CategoryItemDto>>("/api/v1/categories");
        var expectedCategoriesList = items.Select(c => c.ToCategoryItemDto());

        categoriesList.Should()
            .BeEquivalentTo(expectedCategoriesList, options => options
                .Excluding(category => category.Id)
                .Excluding(category => category.CountProducts));
    }
}