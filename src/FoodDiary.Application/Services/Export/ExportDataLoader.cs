using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Export;
using FoodDiary.Domain.Abstractions.v2;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

namespace FoodDiary.Application.Services.Export;

internal class ExportDataLoader : IExportDataLoader
{
    private readonly IFoodDiaryUnitOfWork _unitOfWork;
    private readonly ICaloriesCalculator _caloriesCalculator;
    private readonly IMealNameResolver _mealNameResolver;

    public ExportDataLoader(IFoodDiaryUnitOfWork unitOfWork,
        ICaloriesCalculator caloriesCalculator,
        IMealNameResolver mealNameResolver)
    {
        _unitOfWork = unitOfWork;
        _caloriesCalculator = caloriesCalculator;
        _mealNameResolver = mealNameResolver;
    }
    
    public async Task<ExportFileDto> LoadAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var pages = await _unitOfWork.Pages.GetAsync(startDate, endDate, cancellationToken);

        var exportPages = pages.Select(page => new ExportPageDto
        {
            FormattedDate = page.Date.ToString("dd.MM.yyyy"),
            TotalCalories = _caloriesCalculator.Calculate(page.Notes),
            NoteGroups = GetNoteGroups(page.Notes)
        }).ToArray();

        return new ExportFileDto
        {
            FileName = GenerateExportFileName(startDate, endDate),
            Pages = exportPages
        };
    }
    
    private static string GenerateExportFileName(DateTime startDate, DateTime endDate)
    {
        return $"FoodDiary_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";
    }

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
            MealName = _mealNameResolver.GetMealName(notes.First().MealType),
            TotalCalories = _caloriesCalculator.Calculate(notes),
            Notes = notes.Select(MapNote).ToArray(),
        };
    }

    private ExportNoteDto MapNote(Note note)
    {
        return new ExportNoteDto
        {
            ProductName = note.Product.Name,
            ProductQuantity = note.ProductQuantity,
            Calories = _caloriesCalculator.Calculate(note)
        };
    }
}