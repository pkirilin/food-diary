using System.IO;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using Serilog.Events;
using Serilog.Formatting;

namespace FoodDiary.API.Logging;

public class YandexCloudJsonFormatter : ITextFormatter
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    public void Format(LogEvent logEvent, TextWriter output)
    {
        output.WriteLine(JsonSerializer.Serialize(
            new
            {
                message = logEvent.MessageTemplate.Render(logEvent.Properties),
                level = FormatLevel(logEvent.Level),
                exception = logEvent.Exception,
                properties = logEvent.Properties.ToDictionary(p => p.Key, p => p.Value.ToString().Trim('"'))
            },
            SerializerOptions));
    }

    private static string FormatLevel(LogEventLevel level)
    {
        return level switch
        {
            LogEventLevel.Verbose => "TRACE",
            LogEventLevel.Debug => "DEBUG",
            LogEventLevel.Information => "INFO",
            LogEventLevel.Warning => "WARN",
            LogEventLevel.Error => "ERROR",
            LogEventLevel.Fatal => "FATAL",
            _ => level.ToString()
        };
    }
}