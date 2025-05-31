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

public record RecognizeNoteRequest(IReadOnlyList<IFormFile> Files) : IRequest<RecognizeNoteResult>;

[UsedImplicitly]
internal class RecognizeNoteRequestHandler(
    IChatClient chatClient,
    ILogger<RecognizeNoteRequestHandler> logger) : IRequestHandler<RecognizeNoteRequest, RecognizeNoteResult>
{
    private static readonly ImageOptimizer ImageOptimizer = new();

    private const string SystemPrompt =
        "You are a bot in the calorie tracking app helping users track their calorie intake by analyzing food images";

    private const string UserPrompt =
        """
        Analyze this image and find all the food, meals, or products in it.
        Also, if possible, do not translate product names into English, keep original names from the image.
        """;

    private static readonly ChatOptions ChatOptions = new()
    {
        Temperature = 0.9f,
        Tools = [AIFunctionFactory.Create(ReadRequirementsTool)],
        ToolMode = ChatToolMode.RequireSpecific(nameof(ReadRequirementsTool))
    };

    public async Task<RecognizeNoteResult> Handle(RecognizeNoteRequest request, CancellationToken cancellationToken)
    {
        var imageFile = FindImage(request.Files);
        
        if (imageFile is null)
        {
            return RecognizeNoteResult.ValidationError("No images provided");
        }

        var optimizedImageBytes = await OptimizeImage(imageFile, cancellationToken);
        
        var systemMessage = new ChatMessage(ChatRole.System, SystemPrompt);
        
        var userMessage = new ChatMessage(ChatRole.User,
        [
            new TextContent(UserPrompt),
            new DataContent(optimizedImageBytes, "image/jpeg")
        ]);

        var chatResponse = await chatClient.GetResponseAsync<FoodItemOnTheImage>(
            messages: [systemMessage, userMessage],
            JsonSerializerOptions.Web,
            options: ChatOptions,
            cancellationToken: cancellationToken);

        if (!chatResponse.TryGetResult(out var foodOnImage) && foodOnImage is null)
        {
            logger.LogError("Could not deserialize model response {ModelResponse}", chatResponse.Text);
            return RecognizeNoteResult.InternalServerError("Model response was invalid");
        }

        return new RecognizeNoteResult.Success(new RecognizeNoteResponse([foodOnImage.ToRecognizeNoteItem()]));
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
        ImageOptimizer.LosslessCompress(memoryStream);

        using var image = new MagickImage();
        await image.ReadAsync(memoryStream, cancellationToken);
        image.Format = MagickFormat.Jpeg;
        
        return image.ToByteArray();
    }

    private static string ReadRequirementsTool(ObjectTypeOnImage objectType)
    {
        return objectType switch
        {
            ObjectTypeOnImage.NotAFood => string.Empty,
            ObjectTypeOnImage.PackagedFoodWithLabel =>
                "Analyze the label text and output product name, quantity (weight), energy, and nutritional values. Be precise and always stick to the label text. Keep the original language from the label",
            ObjectTypeOnImage.OtherFood =>
                "Analyze the food on this image and output product name in standard English. Try to be specific and precise. Avoid generic names",
            _ => throw new ArgumentOutOfRangeException(nameof(objectType), objectType, null)
        };
    }
}