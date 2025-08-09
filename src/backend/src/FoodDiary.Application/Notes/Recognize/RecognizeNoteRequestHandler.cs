using System.Collections.Generic;
using System.IO;
using System.Linq;
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
        "You are a bot in the calorie tracking app helping users track their energy and nutritional values intake by analyzing food images and food labels.";

    private const string UserPrompt =
        "Analyze provided images and find all the food, meals, or products on it. If possible, do not translate product names into English, keep original names from images.";

    public async Task<RecognizeNoteResult> Handle(RecognizeNoteRequest request, CancellationToken cancellationToken)
    {
        var images = request.Files
            .Where(file => file.ContentType.StartsWith("image/"))
            .ToList()
            .AsReadOnly();
        
        if (images.Count == 0)
        {
            return RecognizeNoteResult.ValidationError("No images provided");
        }
        
        var systemMessage = new ChatMessage(ChatRole.System, SystemPrompt);
        var userMessage = await CreateUserMessage(images, cancellationToken);

        var chatResponse = await chatClient.GetResponseAsync<FoodItemOnTheImage>(
            messages: [systemMessage, userMessage],
            cancellationToken: cancellationToken);

        if (!chatResponse.TryGetResult(out var foodOnImage) && foodOnImage is null)
        {
            logger.LogError("Could not deserialize model response {ModelResponse}", chatResponse.Text);
            return RecognizeNoteResult.InternalServerError("Model response was invalid");
        }
        
        logger.LogInformation("Deserialized model response: {ModelResponse}", chatResponse.Text);
        return new RecognizeNoteResult.Success(new RecognizeNoteResponse([foodOnImage.ToRecognizeNoteItem()]));
    }

    private static async Task<ChatMessage> CreateUserMessage(
        IReadOnlyCollection<IFormFile> images,
        CancellationToken cancellationToken)
    {
        var optimizedImageTasks = images.Select(image => OptimizeImage(image, cancellationToken));
        var optimizedImageBytes = await Task.WhenAll(optimizedImageTasks);
        
        var imageContents = optimizedImageBytes
            .Select(imageBytes => new DataContent(imageBytes, "image/jpeg"))
            .ToList();
        
        return new ChatMessage(
            role: ChatRole.User,
            contents: [..imageContents, new TextContent(UserPrompt)]);
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
}