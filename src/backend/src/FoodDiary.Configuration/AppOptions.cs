using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Configuration;

public class AppOptions
{
    public bool ForwardHttpsSchemeManuallyForAllRequests { get; init; }
    public required LoggingOptions Logging { get; init; }
    
    [SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
    public class LoggingOptions
    {
        public bool WriteLogsInJsonFormat { get; init; }
        public bool UseYandexCloudLogsFormat { get; init; }
    }
}