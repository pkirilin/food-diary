using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;

namespace FoodDiary.Application.Notes.Recognize;

public record RecognizeNoteCommand(IReadOnlyList<IFormFile> Files);

public class RecognizeNoteCommandHandler(IChatClient chatClient, ILogger<RecognizeNoteCommandHandler> logger)
{
    private const string SystemPrompt =
        "You are a bot in the calorie tracking app helping users track their energy and nutritional values intake by analyzing food images and food labels.";

    private const string UserPrompt =
        "Analyze provided images and find all the food, meals, or products on it. If possible, do not translate product names into English, keep original names from images.";

    public async Task<RecognizeNoteResult> Handle(RecognizeNoteCommand command, CancellationToken cancellationToken)
    {
        var images = command.Files
            .Where(file => file.ContentType.StartsWith("image/"))
            .ToList()
            .AsReadOnly();
        
        if (images.Count == 0)
        {
            return RecognizeNoteResult.NoImagesProvided();
        }
        
        var systemMessage = new ChatMessage(ChatRole.System, SystemPrompt);
        var userMessage = await CreateUserMessage(images, cancellationToken);

        var chatResponse = await chatClient.GetResponseAsync<FoodItemOnTheImage>(
            messages: [systemMessage, userMessage],
            cancellationToken: cancellationToken);

        if (!chatResponse.TryGetResult(out var foodOnImage))
        {
            logger.LogError("Could not deserialize model response {ModelResponse}", chatResponse.Text);
            return RecognizeNoteResult.ModelResponseWasInvalid();
        }
        
        logger.LogInformation("Deserialized model response: {ModelResponse}", chatResponse.Text);
        return new RecognizeNoteResult.Success(new RecognizeNoteResponse([foodOnImage.ToRecognizeNoteItem()]));
    }

    private static async Task<ChatMessage> CreateUserMessage(
        IReadOnlyCollection<IFormFile> images,
        CancellationToken cancellationToken)
    {
        var imageTasks = images.Select(image => GetBytes(image, cancellationToken));
        var imageBytes = await Task.WhenAll(imageTasks);
        
        var imageContents = images
            .Zip(imageBytes, (image, data) => new DataContent(data, image.ContentType))
            .ToList();
        
        return new ChatMessage(
            role: ChatRole.User,
            contents: [..imageContents, new TextContent(UserPrompt)]);
    }

    private static async Task<byte[]> GetBytes(IFormFile file, CancellationToken cancellationToken)
    {
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);
        return memoryStream.ToArray();
    }
}