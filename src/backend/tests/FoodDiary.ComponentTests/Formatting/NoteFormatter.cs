using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using LightBDD.Core.Formatting.Values;

namespace FoodDiary.ComponentTests.Formatting;

internal class NoteFormatter(ICaloriesCalculator caloriesCalculator) : IValueFormatter
{
    public string FormatValue(object value, IValueFormattingService formattingService)
    {
        if (value is not Note note)
        {
            throw new FormatterNotRegisteredException(value);
        }

        var productName = note.Product!.Name;
        var calories = caloriesCalculator.Calculate(note);

        return $"{note.MealType.ToString()}: {productName}, {note.ProductQuantity} g, {calories} cal";
    }
}