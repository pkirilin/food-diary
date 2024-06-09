using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Integrations.OpenAI;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public class OpenAIOptions
{
    public required string BaseUrl { get; init; }
    public required string ApiKey { get; init; }
}