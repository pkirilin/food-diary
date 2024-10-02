using FoodDiary.Domain.WeightTracking;
using LightBDD.Core.Formatting.Values;

namespace FoodDiary.ComponentTests.Formatting;

public class WeightLogFormatter : IValueFormatter
{
    public string FormatValue(object value, IValueFormattingService formattingService)
    {
        if (value is not WeightLog weightLog)
        {
            throw new FormatterNotRegisteredException(value);
        }

        return $"{weightLog.Date:R} - {weightLog.Weight} kg";
    }
}