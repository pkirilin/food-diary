namespace FoodDiary.ComponentTests.Formatting;

internal class FormatterNotRegisteredException : Exception
{
    public FormatterNotRegisteredException(object value)
        : base($"Formatter for type '{value.GetType().FullName}' is not registered")
    {
    }
}