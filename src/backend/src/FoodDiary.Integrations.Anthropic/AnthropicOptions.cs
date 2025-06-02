namespace FoodDiary.Integrations.Anthropic;

internal class AnthropicOptions
{
    public required string BaseUrl { get; init; }
    public required string ApiKey { get; init; }
}