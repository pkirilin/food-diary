using System.Text.Json;
using JetBrains.Annotations;

namespace FoodDiary.Integrations.OpenAI.Contracts;

public record ImageUrl(string Url);

public abstract record MessageContent(string Type)
{
    public record TextContent(string Text) : MessageContent("text");
    public record ImageUrlContent(ImageUrl ImageUrl) : MessageContent("image_url");
}

public class Message
{
    public required string Role { get; init; }
    public required JsonElement Content { get; init; }
}

public class Choice
{
    public required Message Message { get; init; }
}

[PublicAPI]
public class CreateChatCompletionRequest
{
    public required string Model { get; init; }
    public required IReadOnlyList<Message> Messages { get; init; }
    public int? MaxTokens { get; init; }
    public bool? Stream { get; init; }
    public string[]? Stop { get; init; }
}

public class CreateChatCompletionResponse
{
    public required Choice[] Choices { get; init; }
}