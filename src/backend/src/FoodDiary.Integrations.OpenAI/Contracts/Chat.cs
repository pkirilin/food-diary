using JetBrains.Annotations;

namespace FoodDiary.Integrations.OpenAI.Contracts;

public class ImageUrl
{
    public required string Url { get; init; }
}

public class MessageContent
{
    public required string Type { get; init; }
    public string? Text { get; init; }
    public ImageUrl? ImageUrl { get; init; }
}

public class Message
{
    public required string Role { get; init; }
    public required IReadOnlyList<MessageContent> Content { get; init; }
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
}

public class CreateChatCompletionResponse
{
    public required Choice[] Choices { get; init; }
}