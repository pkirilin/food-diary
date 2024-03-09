using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Export;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using FoodDiary.Domain.Utils;

namespace FoodDiary.Application.Services.Export;

internal class ExportDataLoader(
    IPagesRepository repository,
    ICaloriesCalculator caloriesCalculator,
    IMealNameResolver mealNameResolver) : IExportDataLoader
{
    public async Task<ExportFileDto> GetDataAsync(
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken)
    {
        var pages = await repository.Find(pages => BuildQuery(pages, startDate, endDate), cancellationToken);

        var exportPages = pages.Select(page => new ExportPageDto
        {
            FormattedDate = page.Date.ToString("dd.MM.yyyy"),
            TotalCalories = caloriesCalculator.Calculate(page.Notes),
            NoteGroups = GetNoteGroups(page.Notes)
        }).ToArray();

        return new ExportFileDto
        {
            FileName = GenerateExportFileName(startDate, endDate),
            Pages = exportPages
        };
    }

    public async Task<JsonExportFileDto> GetJsonDataAsync(
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken)
    {
        var pages = await repository.Find(pages => BuildQuery(pages, startDate, endDate), cancellationToken);
        var exportPages = pages.Select(page => page.ToJsonExportPageDto());

        return new JsonExportFileDto
        {
            Pages = exportPages
        };
    }

    private static string GenerateExportFileName(DateOnly startDate, DateOnly endDate)
    {
        return $"FoodDiary_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";
    }

    private static IQueryable<Page> BuildQuery(IQueryable<Page> pages, DateOnly startDate, DateOnly endDate) => pages
        .Where(p => p.Date >= startDate && p.Date <= endDate)
        .OrderBy(p => p.Date);

    private ExportNoteGroupDto[] GetNoteGroups(IEnumerable<Note> notes)
    {
        return notes.GroupBy(n => n.MealType)
            .OrderBy(g => g.Key)
            .Select(g => g.OrderBy(n => n.DisplayOrder).ToArray())
            .Select(MapNoteGroup)
            .ToArray();
    }

    private ExportNoteGroupDto MapNoteGroup(ICollection<Note> notes)
    {
        return new ExportNoteGroupDto
        {
            MealName = mealNameResolver.GetMealName(notes.First().MealType),
            TotalCalories = caloriesCalculator.Calculate(notes),
            Notes = notes.Select(MapNote).ToArray(),
        };
    }

    private ExportNoteDto MapNote(Note note)
    {
        return new ExportNoteDto
        {
            ProductName = note.Product.Name,
            ProductQuantity = note.ProductQuantity,
            Calories = caloriesCalculator.Calculate(note)
        };
    }
}