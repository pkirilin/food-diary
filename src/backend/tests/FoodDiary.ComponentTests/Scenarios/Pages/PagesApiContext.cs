using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.API.Requests;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.DateAndTime;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Scenarios.Pages;

public class PagesApiContext : BaseContext
{
    private PagesSearchResultDto? _pagesSearchResult;
    private PageContentDto? _getPageByIdResult;
    private string? _dateForNewPage;
    private HttpResponseMessage _createPageResponse = null!;
    private HttpResponseMessage _updatePageResponse = null!;
    private HttpResponseMessage _deletePageResponse = null!;
    private HttpResponseMessage _deleteMultiplePagesResponse = null!;
    
    public PagesApiContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }

    public Task Given_pages(params Page[] pages)
    {
        return Factory.SeedDataAsync(pages);
    }

    public async Task When_user_retieves_pages_list_from_to(string from, string to)
    {
        _pagesSearchResult = await ApiClient
            .GetFromJsonAsync<PagesSearchResultDto>($"/api/v1/pages?startDate={from}&endDate={to}");
    }

    public async Task When_user_retieves_page_by_id(int id)
    {
        _getPageByIdResult = await ApiClient.GetFromJsonAsync<PageContentDto>($"/api/v1/pages/{id}");
    }
    
    public async Task When_user_retieves_pages_list()
    {
        _pagesSearchResult = await ApiClient.GetFromJsonAsync<PagesSearchResultDto>("/api/v1/pages");
    }

    public async Task When_user_creates_page(Page page)
    {
        var request = new PageCreateEditRequest { Date = page.Date };
        _createPageResponse = await ApiClient.PostAsJsonAsync("/api/v1/pages", request);
    }

    public async Task When_user_updates_page(Page page)
    {
        var request = new PageCreateEditRequest { Date = page.Date };
        _updatePageResponse = await ApiClient.PutAsJsonAsync($"/api/v1/pages/{page.Id}", request);
    }

    public async Task When_user_deletes_page(Page page)
    {
        _deletePageResponse = await ApiClient.DeleteAsync($"/api/v1/pages/{page.Id}");
    }
    
    public async Task When_user_deletes_multiple_pages(params Page[] pages)
    {
        var pageIds = pages.Select(p => p.Id);
        
        var request = new HttpRequestMessage(HttpMethod.Delete, "/api/v1/pages/batch")
        {
            Content = new StringContent(JsonSerializer.Serialize(pageIds), Encoding.Unicode, "application/json")
        };

        _deleteMultiplePagesResponse = await ApiClient.SendAsync(request);
    }

    public async Task When_user_retieves_date_for_new_page()
    {
         var response = await ApiClient.GetAsync("/api/v1/pages/date");
         _dateForNewPage = await response.Content.ReadAsStringAsync();
    }
    
    public Task Then_pages_list_contains_total_items_count(int count)
    {
        _pagesSearchResult?.TotalPagesCount.Should().Be(count);
        return Task.CompletedTask;
    }
    
    public Task Then_pages_list_contains_items(params Page[] items)
    {
        var caloriesCalculator = Factory.Services.GetRequiredService<ICaloriesCalculator>();
        var expectedPageItems = items.Select(p => p.ToPageItemDto(caloriesCalculator));
        
        _pagesSearchResult?.PageItems
            .Should()
            .BeEquivalentTo(expectedPageItems, options => options.Excluding(page => page.Id));
        
        return Task.CompletedTask;
    }

    public Task Then_pages_list_is_empty()
    {
        _pagesSearchResult?.PageItems.Should().BeEmpty();
        return Task.CompletedTask;
    }

    public Task Then_page_by_id_contains_item(Page item)
    {
        _getPageByIdResult?.CurrentPage.Date.Should().Be(item.Date);
        return Task.CompletedTask;
    }
    
    public Task Then_page_is_successfully_created()
    {
        _createPageResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }

    public Task Then_page_is_successfully_updated()
    {
        _updatePageResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_page_is_successfully_deleted()
    {
        _deletePageResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_multiple_pages_are_successfully_deleted()
    {
        _deleteMultiplePagesResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }

    public Task Then_date_for_new_page_contains_value(string value)
    {
        _dateForNewPage.Should().Be(value);
        return Task.CompletedTask;
    }
    
    public Task Then_date_for_new_page_is_today()
    {
        _dateForNewPage.Should().Be(FakeDateTimeProvider.CurrentFakeDateAsString);
        return Task.CompletedTask;
    }
}