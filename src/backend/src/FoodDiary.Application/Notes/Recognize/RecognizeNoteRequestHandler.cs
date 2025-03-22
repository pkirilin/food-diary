using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using ImageMagick;
using JetBrains.Annotations;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using RecognizeNoteResult = FoodDiary.Application.Result<FoodDiary.Application.Notes.Recognize.RecognizeNoteResponse>;

namespace FoodDiary.Application.Notes.Recognize;

[PublicAPI]
public record RecognizeProductItem(string Name, int CaloriesCost);

[PublicAPI]
public record RecognizeNoteItem(RecognizeProductItem Product, int Quantity);

[PublicAPI]
public record RecognizeNoteResponse(IReadOnlyList<RecognizeNoteItem> Notes);

public record RecognizeNoteRequest(IReadOnlyList<IFormFile> Files) : IRequest<RecognizeNoteResult>;

[UsedImplicitly]
internal class RecognizeNoteRequestHandler(
    IChatClient chatClient,
    ILogger<RecognizeNoteRequestHandler> logger) : IRequestHandler<RecognizeNoteRequest, RecognizeNoteResult>
{
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

    private static readonly ChatOptions ChatOptions = new()
    {
        MaxOutputTokens = 4000
    };

    public async Task<RecognizeNoteResult> Handle(
        RecognizeNoteRequest request,
        CancellationToken cancellationToken)
    {
        var imageFile = FindImage(request.Files);

        if (imageFile is null)
        {
            return RecognizeNoteResult.ValidationError("No images provided");
        }

        var optimizedImageBytes = await OptimizeImage(imageFile, cancellationToken);

        var chatMessage = new ChatMessage(ChatRole.User,
        [
            new TextContent(Prompt),
            new DataContent(optimizedImageBytes, "image/jpeg")
        ]);

        var chatResponse = await chatClient.GetResponseAsync(chatMessage, ChatOptions, cancellationToken);

        return !TryParseNotesFromModelResponse(chatResponse, out var recognizedNotes)
            ? RecognizeNoteResult.InternalServerError("Model response was invalid")
            : new RecognizeNoteResult.Success(new RecognizeNoteResponse(recognizedNotes));
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
        ChatResponse response,
        out IReadOnlyList<RecognizeNoteItem> recognizedNotes)
    {
        try
        {
            var notes = JsonSerializer.Deserialize<IReadOnlyList<RecognizeNoteItem>>(response.Text, SerializerOptions);

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
            logger.LogError(
                "Failed to parse recognized notes from {ModelId} model response: {ContentText}",
                response.ModelId, response.Text);
            return false;
        }
    }
}