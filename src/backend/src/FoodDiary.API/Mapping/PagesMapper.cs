using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

namespace FoodDiary.API.Mapping;

public static class PagesMapper
{
    public static PageItemDto ToPageItemDto(this Page page, ICaloriesCalculator caloriesCalculator) => new()
    {
        Id = page.Id,
        Date = page.Date.ToString("yyyy-MM-dd"),
        CountNotes = page.Notes.Count,
        CountCalories = caloriesCalculator.Calculate(page.Notes)
    };
}