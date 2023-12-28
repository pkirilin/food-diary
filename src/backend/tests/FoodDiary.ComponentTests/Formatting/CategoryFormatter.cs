using FoodDiary.Domain.Entities;
using LightBDD.Core.Formatting.Values;

namespace FoodDiary.ComponentTests.Formatting;

internal class CategoryFormatter : IValueFormatter
{
    public string FormatValue(object value, IValueFormattingService formattingService)
    {
        if (value is not Category category)
        {
            throw new FormatterNotRegisteredException(value);
        }

        return category.Name;
    }
}