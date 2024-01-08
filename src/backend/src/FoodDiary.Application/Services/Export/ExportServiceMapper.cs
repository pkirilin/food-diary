using System.Linq;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Services.Export;

public static class ExportServiceMapper
{
    public static JsonExportPageDto ToJsonExportPageDto(this Page page)
    {
        return new JsonExportPageDto
        {
            Date = page.Date,
            Notes = page.Notes.Select(note => note.ToJsonExportNoteDto())
        };
    }

    private static JsonExportNoteDto ToJsonExportNoteDto(this Note note)
    {
        return new JsonExportNoteDto
        {
            MealType = (int)note.MealType,
            DisplayOrder = note.DisplayOrder,
            ProductQuantity = note.ProductQuantity,
            Product = note.ToJsonExportProductDto()
        };
    }

    private static JsonExportProductDto ToJsonExportProductDto(this Note note)
    {
        return new JsonExportProductDto
        {
            Name = note.Product.Name,
            CaloriesCost = note.Product.CaloriesCost,
            DefaultQuantity = note.Product.DefaultQuantity,
            Category = note.Product.Category.Name
        };
    }
}