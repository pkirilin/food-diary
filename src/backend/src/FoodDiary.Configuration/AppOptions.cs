using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Configuration;

public class AppOptions
{
    public required LoggingOptions Logging { get; init; }

    [SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
    public class LoggingOptions
    {
        public bool WriteLogsInJsonFormat { get; init; }
    }
}