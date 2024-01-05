using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.DateAndTime;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Scenarios.Pages;

public class PagesApiContext : BaseContext
{
    private PagesSearchResultDto? _pagesSearchResult;
    private string? _dateForNewPage;
    
    public PagesApiContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }

    public Task Given_pages(params Page[] pages)
    {
        return Factory.SeedDataAsync(pages);
    }

    public async Task When_user_retieves_pages_list_from_to(string from, string to)
    {
        _pagesSearchResult = await ApiClient.GetFromJsonAsync<PagesSearchResultDto>(
            $"/api/v1/pages?startDate={from}&endDate={to}");
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
        _pagesSearchResult?.PageItems.Should().BeEquivalentTo(expectedPageItems);
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