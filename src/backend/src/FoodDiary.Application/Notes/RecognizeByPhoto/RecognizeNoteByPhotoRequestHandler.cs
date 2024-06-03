using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Integrations.OpenAI;
using FoodDiary.Integrations.OpenAI.Contracts;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Notes.RecognizeByPhoto;

public record RecognizeProductItem(string Name, int CaloriesCost);

public record RecognizeNoteItem(RecognizeProductItem Product, int Quantity);

public abstract record RecognizeNoteByPhotoResponse
{
    public record Success(IReadOnlyList<RecognizeNoteItem> Notes) : RecognizeNoteByPhotoResponse;
}

public record RecognizeNoteByPhotoRequest(IReadOnlyList<string> PhotoUrls) : IRequest<RecognizeNoteByPhotoResponse>;

[UsedImplicitly]
internal class RecognizeNoteByPhotoRequestHandler(IOpenAiApiClient openAiApiClient)
    : IRequestHandler<RecognizeNoteByPhotoRequest, RecognizeNoteByPhotoResponse>
{
    public async Task<RecognizeNoteByPhotoResponse> Handle(
        RecognizeNoteByPhotoRequest request,
        CancellationToken cancellationToken)
    {
        var createChatCompletionRequest = new CreateChatCompletionRequest
        {
            Model = "gpt-4o",
            MaxTokens = 1000,
            Stream = false,
            Messages =
            [
                new Message
                {
                    Role = "user",
                    Content = JsonSerializer.SerializeToElement(new MessageContent[]
                    {
                        new MessageContent.TextContent(BuildPrompt()),
                        new MessageContent.ImageUrlContent(request.PhotoUrls[0])
                    })
                }
            ]
        };

        var createChatCompletionResponse = await openAiApiClient.CreateChatCompletion(
            createChatCompletionRequest,
            cancellationToken);
        
        var recognizedNotes = ParseRecognizedNotes(createChatCompletionResponse);

        return new RecognizeNoteByPhotoResponse.Success(recognizedNotes);
    }

    private static string BuildPrompt()
    {
        return "Describe the following image";
    }

    private static IReadOnlyList<RecognizeNoteItem> ParseRecognizedNotes(CreateChatCompletionResponse response)
    {
        return [];
    }
}