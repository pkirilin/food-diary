using System;
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
        "You analyze food images for a calorie tracker. Return strictly the JSON schema you are given. " +
        "Numbers must be numeric (never strings, never \"null\"). " +
        "All energy values are kilocalories (kcal), never joules.";

    private const string UserPrompt =
        "Identify the food/product in the image(s) and fill the schema using these rules:\n" +
        "1. If no image contains food or a product, set status=NotAProduct and product=null.\n" +
        "2. If a nutrition label is visible, fill every field that is printed on the label. Leave unprinted optional fields null. Do not guess label values.\n" +
        "3. If only a product photo (no label) is shown, fill every field from your own knowledge of that product.\n" +
        "4. If multiple images show the same product (e.g. front + back of a label), merge information across them as one product.\n" +
        "5. If multiple images show different products, keep only the largest/most prominent one and ignore the rest.\n\n" +
        "All energy/nutrient values are per 100 g of product, not per package. Convert if the label only shows per-serving or per-package values. " +
        "Calories are kilocalories (kcal). Keep product names in their original language; do not translate. Start the name with an uppercase letter.";

    public async Task<RecognizeNoteResult> Handle(RecognizeNoteCommand command, CancellationToken cancellationToken)
    {
        var images = command.Files
            .Where(file => file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            .ToList()
            .AsReadOnly();

        if (images.Count == 0)
        {
            return RecognizeNoteResult.NoImagesProvided();
        }

        var systemMessage = new ChatMessage(ChatRole.System, SystemPrompt);
        var userMessage = await CreateUserMessage(images, cancellationToken);

        var chatResponse = await chatClient.GetResponseAsync<RecognizeNoteModelResponse>(
            messages: [systemMessage, userMessage],
            cancellationToken: cancellationToken);

        if (!chatResponse.TryGetResult(out var modelResponse))
        {
            logger.LogError("Could not deserialize model response {ModelResponse}", chatResponse.Text);
            return RecognizeNoteResult.ModelResponseWasInvalid();
        }

        logger.LogInformation("Deserialized model response: {ModelResponse}", chatResponse.Text);

        if (modelResponse.Status == RecognitionStatus.NotAProduct)
        {
            return RecognizeNoteResult.NotAProductImage();
        }

        if (modelResponse.Product is null)
        {
            logger.LogError("Model returned Recognized status without a product payload: {ModelResponse}", chatResponse.Text);
            return RecognizeNoteResult.ModelResponseWasInvalid();
        }

        return new RecognizeNoteResult.Success(
            new RecognizeNoteResponse([modelResponse.Product.ToRecognizeNoteItem()]));
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
