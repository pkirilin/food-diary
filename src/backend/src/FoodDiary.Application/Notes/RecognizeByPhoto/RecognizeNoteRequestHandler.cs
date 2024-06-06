using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Integrations.OpenAI;
using FoodDiary.Integrations.OpenAI.Contracts;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Notes.RecognizeByPhoto;

[PublicAPI]
public record RecognizeProductItem(string Name, int CaloriesCost);

[PublicAPI]
public record RecognizeNoteItem(RecognizeProductItem Product, int Quantity);

public abstract record RecognizeNoteResponse
{
    public record Success(IReadOnlyList<RecognizeNoteItem> Notes) : RecognizeNoteResponse;
}

public record RecognizeNoteRequest(IReadOnlyList<string> PhotoUrls) : IRequest<RecognizeNoteResponse>;

[UsedImplicitly]
internal class RecognizeNoteRequestHandler(IOpenAiApiClient openAiApiClient)
    : IRequestHandler<RecognizeNoteRequest, RecognizeNoteResponse>
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private static readonly JsonSerializerOptions OpenAiSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };
    
    private const int MaxTokens = 1000;
    private const string EndToken = "[END]";

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
         {EndToken}
         """;

    public async Task<RecognizeNoteResponse> Handle(
        RecognizeNoteRequest request,
        CancellationToken cancellationToken)
    {
        var createChatCompletionRequest = new CreateChatCompletionRequest
        {
            Model = "gpt-4o",
            Stream = false,
            Stop = [EndToken],
            MaxTokens = MaxTokens,
            Messages =
            [
                new Message
                {
                    Role = "user",
                    Content = JsonSerializer.SerializeToElement(
                        new object[]
                        {
                            new MessageContent.TextContent(Prompt),
                            new MessageContent.ImageUrlContent(new ImageUrl(request.PhotoUrls[0]))
                        },
                        OpenAiSerializerOptions)
                }
            ]
        };

        var createChatCompletionResponse = await openAiApiClient.CreateChatCompletion(
            createChatCompletionRequest,
            cancellationToken);

        var recognizedNotes = ParseRecognizedNotes(createChatCompletionResponse);

        return new RecognizeNoteResponse.Success(recognizedNotes);
    }

    private static IReadOnlyList<RecognizeNoteItem> ParseRecognizedNotes(CreateChatCompletionResponse response)
    {
        try
        {
            var messageContentElement = response.Choices[0].Message.Content;

            if (messageContentElement.ValueKind != JsonValueKind.String)
            {
                // TODO: add logging
                return [];
            }

            var messageContent = messageContentElement.GetString() ?? "[]";

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