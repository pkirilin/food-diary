using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.Application;
using FoodDiary.Application.Notes.Recognize;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FoodDiary.UnitTests.Notes.Recognize;

public class RecognizeNoteCommandHandlerTests
{
    [Fact]
    public async Task Handle_NoImageFiles_ReturnsNoImagesProvided()
    {
        var handler = CreateHandler(out _);
        var command = new RecognizeNoteCommand(new List<IFormFile>
        {
            CreateFile("note.txt", "text/plain")
        });

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().BeOfType<RecognizeNoteResult.Failure>()
            .Which.Error.Should().BeOfType<Error.ValidationError>();
    }

    [Fact]
    public async Task Handle_StatusNotAProduct_ReturnsValidationFailure()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, """{"Status":"NotAProduct","Product":null}""");

        var result = await handler.Handle(SingleImageCommand(), CancellationToken.None);

        result.Should().BeOfType<RecognizeNoteResult.Failure>()
            .Which.Error.Should().BeOfType<Error.ValidationError>()
            .Which.Description.Should().Contain("recognizable product");
    }

    [Fact]
    public async Task Handle_StatusRecognizedButProductNull_ReturnsValidationFailure()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, """{"Status":"Recognized","Product":null}""");

        var result = await handler.Handle(SingleImageCommand(), CancellationToken.None);

        result.Should().BeOfType<RecognizeNoteResult.Failure>()
            .Which.Error.Should().BeOfType<Error.ValidationError>();
    }

    [Fact]
    public async Task Handle_RecognizedProduct_MapsToSuccess()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, """
            {
              "Status": "Recognized",
              "Product": {
                "Name": "Bread",
                "Quantity": 200,
                "Calories": 257.6,
                "BrandName": "Acme",
                "Protein": 8.1,
                "Fats": 2.5,
                "Carbs": 48.4,
                "Sugar": 3.2,
                "Salt": 0.5
              }
            }
            """);

        var result = await handler.Handle(SingleImageCommand(), CancellationToken.None);

        var success = result.Should().BeOfType<RecognizeNoteResult.Success>().Subject;
        success.Response.Notes.Should().HaveCount(1);
        success.Response.Notes[0].Quantity.Should().Be(200);
        success.Response.Notes[0].Product.CaloriesCost.Should().Be(258);
        success.Response.Notes[0].Product.Name.Should().Be("Bread (Acme)");
    }

    [Fact]
    public async Task Handle_ModelReturnsUnparseableJson_ReturnsModelResponseWasInvalid()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, "not json");

        var result = await handler.Handle(SingleImageCommand(), CancellationToken.None);

        result.Should().BeOfType<RecognizeNoteResult.Failure>()
            .Which.Error.Should().BeOfType<Error.InternalServerError>();
    }

    private static RecognizeNoteCommand SingleImageCommand() =>
        new(new List<IFormFile> { CreateFile("a.jpg", "image/jpeg") });

    private static IFormFile CreateFile(string name, string contentType)
    {
        var bytes = Encoding.UTF8.GetBytes("fake");
        var stream = new MemoryStream(bytes);
        return new FormFile(stream, 0, bytes.Length, name, name)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }

    private static RecognizeNoteCommandHandler CreateHandler(out FakeChatClient chatClient)
    {
        chatClient = new FakeChatClient();
        return new RecognizeNoteCommandHandler(
            chatClient,
            NullLogger<RecognizeNoteCommandHandler>.Instance);
    }

    private static void SetupChatJson(FakeChatClient chatClient, string json)
    {
        chatClient.Response = new ChatResponse(new ChatMessage(ChatRole.Assistant, json));
    }
}

internal sealed class FakeChatClient : IChatClient
{
    public ChatResponse? Response { get; set; }

    public Task<ChatResponse> GetResponseAsync(
        IEnumerable<ChatMessage> messages,
        ChatOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Response ?? new ChatResponse(new ChatMessage(ChatRole.Assistant, string.Empty)));
    }

    public IAsyncEnumerable<ChatResponseUpdate> GetStreamingResponseAsync(
        IEnumerable<ChatMessage> messages,
        ChatOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public object? GetService(Type serviceType, object? serviceKey = null) => null;

    public void Dispose() { }
}
