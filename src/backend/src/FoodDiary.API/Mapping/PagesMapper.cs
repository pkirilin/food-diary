using System.Linq;
using FoodDiary.API.Dtos;
using FoodDiary.Application.Models;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

namespace FoodDiary.API.Mapping;

public static class PagesMapper
{
    public static PageItemDto ToPageItemDto(this Page page, ICaloriesCalculator caloriesCalculator) => new(
        page.Id,
        page.DateNew,
        page.Notes.Count,
        caloriesCalculator.Calculate(page.Notes));

    public static PageContentDto ToPageContentDto(this Page page) => new()
    {
        CurrentPage = new PageDto
        {
            Id = page.Id,
            Date = page.DateNew
        }
    };

    public static PagesSearchResultDto ToPagesSearchResultDto(
        this PagesSearchResult result,
        ICaloriesCalculator caloriesCalculator) => new()
        {
            PageItems = result.FoundPages.Select(p => p.ToPageItemDto(caloriesCalculator)),
            TotalPagesCount = result.TotalPagesCount
        };
}