namespace FoodDiary.ComponentTests.Formatting;

internal class FormatterNotRegisteredException(object value)
    : Exception($"Formatter for type '{value.GetType().FullName}' is not registered");