using System;
using System.ClientModel;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using ImageMagick;
using JetBrains.Annotations;
using MediatR;
using Microsoft.AspNetCore.Http;
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
    public record InvalidRequest(string Message) : RecognizeNoteResponse;
}

public record RecognizeNoteRequest(IReadOnlyList<IFormFile> Files) : IRequest<RecognizeNoteResponse>;

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
    private const int ImageMaxSize = 512;

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
         Also, if possible, DO NOT translate product names into English, keep original names from the image.
         """;

    public async Task<RecognizeNoteResponse> Handle(
        RecognizeNoteRequest request,
        CancellationToken cancellationToken)
    {
        var imageFile = FindImage(request.Files);
        
        if (imageFile is null)
        {
            return new RecognizeNoteResponse.InvalidRequest("No image was provided");
        }
        
        var imageBytes = await ResizeAndConvertToByteArray(imageFile, cancellationToken);
        
        var chatClient = openAIClient.GetChatClient(Model);

        var chatCompletion = await chatClient.CompleteChatAsync(
            [
                ChatMessage.CreateUserMessage(
                [
                    ChatMessageContentPart.CreateTextMessageContentPart(Prompt),
                    ChatMessageContentPart.CreateImageMessageContentPart(
                        BinaryData.FromBytes(imageBytes),
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

    private static IFormFile? FindImage(IReadOnlyCollection<IFormFile> files)
    {
        return files.FirstOrDefault(f => f.ContentType.StartsWith("image/"));
    }

    private static async Task<byte[]> ResizeAndConvertToByteArray(
        IFormFile imageFile,
        CancellationToken cancellationToken)
    {
        await using var stream = imageFile.OpenReadStream();
        using var image = new MagickImage();
        await image.ReadAsync(stream, cancellationToken);
        image.Format = MagickFormat.Jpeg;

        if (image.Width > ImageMaxSize)
        {
            image.Resize(ImageMaxSize, 0);
        }
        else if (image.Height > ImageMaxSize)
        {
            image.Resize(0, ImageMaxSize);
        }

        return image.ToByteArray();
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