using System;
using System.ClientModel;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using ImageMagick;
using JetBrains.Annotations;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using OpenAI;
using OpenAI.Chat;

namespace FoodDiary.Application.Notes.Recognize;

[PublicAPI]
public record RecognizeProductItem(string Name, int CaloriesCost);

[PublicAPI]
public record RecognizeNoteItem(RecognizeProductItem Product, int Quantity);

[PublicAPI]
public enum ErrorType
{
    NoImagesProvided,
    ImageDoesNotContainFood
}

public abstract record RecognizeNoteResponse
{
    public record Success(IReadOnlyList<RecognizeNoteItem> Notes) : RecognizeNoteResponse;
    public record InvalidRequest(ErrorType Type) : RecognizeNoteResponse;
    public record InvalidModelResponse : RecognizeNoteResponse;
}

public record RecognizeNoteRequest(IReadOnlyList<IFormFile> Files) : IRequest<RecognizeNoteResponse>;

[UsedImplicitly]
internal class RecognizeNoteRequestHandler(
    [SuppressMessage("ReSharper", "InconsistentNaming")]
    OpenAIClient openAIClient,
    ILogger<RecognizeNoteRequestHandler> logger)
    : IRequestHandler<RecognizeNoteRequest, RecognizeNoteResponse>
{
    private const string Model = "gpt-4o";
    private const int ImageMaxSize = 512;
    
    private static readonly ImageOptimizer ImageOptimizer = new();
    
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

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

    private static readonly ChatCompletionOptions CompletionOptions = new()
    {
        MaxTokens = 4000
    };

    public async Task<RecognizeNoteResponse> Handle(
        RecognizeNoteRequest request,
        CancellationToken cancellationToken)
    {
        var imageFile = FindImage(request.Files);
        
        if (imageFile is null)
        {
            return new RecognizeNoteResponse.InvalidRequest(ErrorType.NoImagesProvided);
        }
        
        var optimizedImageBytes = await OptimizeImage(imageFile, cancellationToken);
        
        var chatClient = openAIClient.GetChatClient(Model);

        var chatCompletion = await chatClient.CompleteChatAsync(
            [
                ChatMessage.CreateUserMessage(
                [
                    ChatMessageContentPart.CreateTextMessageContentPart(Prompt),
                    ChatMessageContentPart.CreateImageMessageContentPart(
                        BinaryData.FromBytes(optimizedImageBytes),
                        "image/jpeg")
                ])
            ],
            CompletionOptions);

        if (!TryParseNotesFromModelResponse(chatCompletion, out var recognizedNotes))
        {
            return new RecognizeNoteResponse.InvalidModelResponse();
        }

        if (!recognizedNotes.Any())
        {
            return new RecognizeNoteResponse.InvalidRequest(ErrorType.ImageDoesNotContainFood);
        }

        return new RecognizeNoteResponse.Success(recognizedNotes);
    }

    private static IFormFile? FindImage(IReadOnlyCollection<IFormFile> files)
    {
        return files.FirstOrDefault(file => file.ContentType.StartsWith("image/"));
    }

    private static async Task<byte[]> OptimizeImage(IFormFile imageFile, CancellationToken cancellationToken)
    {
        await using var stream = imageFile.OpenReadStream();
        using var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream, cancellationToken);
        memoryStream.Position = 0;
        ImageOptimizer.Compress(memoryStream);
        
        using var image = new MagickImage();
        await image.ReadAsync(memoryStream, cancellationToken);
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

    private bool TryParseNotesFromModelResponse(
        ClientResult<ChatCompletion> chatCompletion,
        out IReadOnlyList<RecognizeNoteItem> recognizedNotes)
    {
        var content = chatCompletion.Value.Content.ElementAtOrDefault(0);
        
        if (content is null)
        {
            recognizedNotes = [];
            return false;
        }
        
        try
        {
            var notes = JsonSerializer.Deserialize<IReadOnlyList<RecognizeNoteItem>>(content.Text, SerializerOptions);

            if (notes is null)
            {
                recognizedNotes = [];
                return false;
            }

            recognizedNotes = notes;
            return true;
        }
        catch (Exception)
        {
            recognizedNotes = [];
            logger.LogError("Failed to parse recognized notes from {Model} model response: {ContentText}",
                Model,
                content.Text);
            return false;
        }
    }
}
