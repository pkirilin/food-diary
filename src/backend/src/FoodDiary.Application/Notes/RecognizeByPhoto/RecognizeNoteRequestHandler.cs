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

    public async Task<RecognizeNoteResponse> Handle(
        RecognizeNoteRequest request,
        CancellationToken cancellationToken)
    {
        var createChatCompletionRequest = new CreateChatCompletionRequest
        {
            Model = "gpt-4o",
            MaxTokens = 1000,
            Stream = false,
            Stop = ["[[END]]"],
            Messages =
            [
                new Message
                {
                    Role = "user",
                    Content = JsonSerializer.SerializeToElement(
                        new object[]
                        {
                            new MessageContent.TextContent(BuildPrompt()),
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

    private static string BuildPrompt()
    {
        return "Describe this image[[END]]";
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