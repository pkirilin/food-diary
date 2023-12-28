using System.Globalization;
using FoodDiary.Domain.Entities;
using LightBDD.Core.Formatting.Values;

namespace FoodDiary.ComponentTests.Formatting;

internal class PageFormatter : IValueFormatter
{
    public string FormatValue(object value, IValueFormattingService formattingService)
    {
        if (value is not Page page)
        {
            throw new FormatterNotRegisteredException(value);
        }
        
        return page.Date.ToString("s", CultureInfo.InvariantCulture)[..10];
    }
}