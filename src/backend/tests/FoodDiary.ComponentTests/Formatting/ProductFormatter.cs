using FoodDiary.Domain.Entities;
using LightBDD.Core.Formatting.Values;

namespace FoodDiary.ComponentTests.Formatting;

internal class ProductFormatter : IValueFormatter
{
    public string FormatValue(object value, IValueFormattingService formattingService)
    {
        if (value is not Product product)
        {
            throw new FormatterNotRegisteredException(value);
        }

        return $"{product.Name} ({product.Category?.Name})";
    }
}