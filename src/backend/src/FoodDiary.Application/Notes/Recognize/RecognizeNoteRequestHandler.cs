using System;
using System.ClientModel;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;
using MediatR;
using OpenAI;
using OpenAI.Chat;

namespace FoodDiary.Application.Notes.Recognize;

[PublicAPI]
public record RecognizeProductItem(string Name, int CaloriesCost);

[PublicAPI]
public record RecognizeNoteItem(RecognizeProductItem Product, int Quantity);

public abstract record RecognizeNoteResponse
{
    public record Success(IReadOnlyList<RecognizeNoteItem> Notes) : RecognizeNoteResponse;
}

public record RecognizeNoteRequest(IReadOnlyList<byte[]> Photos) : IRequest<RecognizeNoteResponse>;

[UsedImplicitly]
internal class RecognizeNoteRequestHandler(
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    OpenAIClient openAIClient)
    : IRequestHandler<RecognizeNoteRequest, RecognizeNoteResponse>
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private const string Model = "gpt-4o";
    private const int MaxTokens = 1000;

    private static readonly string ExampleNoteAsJson = JsonSerializer.Serialize(
        new RecognizeNoteItem(
            Product: new RecognizeProductItem(
                Name: "Bread",
                CaloriesCost: 125),
            Quantity: 50),
        SerializerOptions);

    private static readonly string Prompt =
        $"""
         Find all the food, meals, or products in this image. Output them as an array of items using the following JSON format:
         ```
         {ExampleNoteAsJson}
         ```
         where `quantity` is measured in grams and `caloriesCost` is measured in kilocalories per 100 grams of the product.

         IMPORTANT: do NOT provide any text notes in your response, only the JSON string WITHOUT the "```" backticks.
         Also, if possible, DO NOT translate product and category names into English, keep original names from the image.
         """;

    public async Task<RecognizeNoteResponse> Handle(
        RecognizeNoteRequest request,
        CancellationToken cancellationToken)
    {
        var chatClient = openAIClient.GetChatClient(Model);

        var chatCompletion = await chatClient.CompleteChatAsync(
            [
                ChatMessage.CreateUserMessage(
                [
                    ChatMessageContentPart.CreateTextMessageContentPart(Prompt),
                    ChatMessageContentPart.CreateImageMessageContentPart(
                        BinaryData.FromBytes(request.Photos[0]),
                        "image/jpeg")
                ])
            ],
            new ChatCompletionOptions
            {
                MaxTokens = MaxTokens
            });

        var recognizedNotes = ParseRecognizedNotes(chatCompletion);

        return new RecognizeNoteResponse.Success(recognizedNotes);
    }

    private static IReadOnlyList<RecognizeNoteItem> ParseRecognizedNotes(ClientResult<ChatCompletion> chatCompletion)
    {
        try
        {
            var messageContent = chatCompletion.Value.Content.ElementAtOrDefault(0)?.Text ?? "[]";

            var recognizedNotes = JsonSerializer.Deserialize<IReadOnlyList<RecognizeNoteItem>>(
                messageContent,
                SerializerOptions);

            return recognizedNotes ?? Array.Empty<RecognizeNoteItem>();
        }
        catch (Exception e)
        {
            // TODO: add logging
            return [];
        }
    }
}