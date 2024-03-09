using System.Linq;
using FoodDiary.API.Dtos;
using FoodDiary.Application.Pages.Find;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

namespace FoodDiary.API.Mapping;

public static class PagesMapper
{
    public static PageItemDto ToPageItemDto(this Page page, ICaloriesCalculator caloriesCalculator) => new(
        page.Id,
        page.Date,
        page.Notes.Count,
        caloriesCalculator.Calculate(page.Notes));

    public static PageContentDto ToPageContentDto(this Page page) => new()
    {
        CurrentPage = new PageDto
        {
            Id = page.Id,
            Date = page.Date
        }
    };

    public static PagesSearchResultDto ToPagesSearchResultDto(
        this FindPagesResponse.Success response,
        ICaloriesCalculator caloriesCalculator) => new()
        {
            PageItems = response.FoundPages.Select(p => p.ToPageItemDto(caloriesCalculator)),
            TotalPagesCount = response.TotalPagesCount
        };
}