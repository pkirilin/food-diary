using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.Application;
using FoodDiary.Application.Products.SuggestNutrition;
using FoodDiary.UnitTests.Notes.Recognize;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FoodDiary.UnitTests.Products.SuggestNutrition;

public class SuggestNutritionCommandHandlerTests
{
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Handle_BlankName_ReturnsNameIsRequired(string name)
    {
        var handler = CreateHandler(out _);

        var result = await handler.Handle(new SuggestNutritionCommand(name), CancellationToken.None);

        result.Should().BeOfType<SuggestNutritionResult.Failure>()
            .Which.Error.Should().BeOfType<Error.ValidationError>();
    }

    [Fact]
    public async Task Handle_ValidJson_RoundsAndReturnsSuccess()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, """
            { "Calories": 402.6, "Protein": 25.014, "Fats": 33.1, "Carbs": 1.3, "Sugar": 0.5, "Salt": 1.8 }
            """);

        var result = await handler.Handle(new SuggestNutritionCommand("Cheddar cheese"), CancellationToken.None);

        var success = result.Should().BeOfType<SuggestNutritionResult.Success>().Subject;
        success.Response.Calories.Should().Be(403);
        success.Response.Protein.Should().Be(25.01m);
        success.Response.Fats.Should().Be(33.1m);
    }

    [Theory]
    [InlineData(0, 1)]
    [InlineData(1500, 1000)]
    public async Task Handle_CaloriesOutOfRange_ClampsToSchemaRange(int rawCalories, int expected)
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, $$"""{ "Calories": {{rawCalories}} }""");

        var result = await handler.Handle(new SuggestNutritionCommand("Water"), CancellationToken.None);

        result.Should().BeOfType<SuggestNutritionResult.Success>()
            .Which.Response.Calories.Should().Be(expected);
    }

    [Fact]
    public async Task Handle_NullFields_PreservedAsNull()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, """{ "Calories": 50, "Protein": null }""");

        var result = await handler.Handle(new SuggestNutritionCommand("Lettuce"), CancellationToken.None);

        var success = result.Should().BeOfType<SuggestNutritionResult.Success>().Subject;
        success.Response.Protein.Should().BeNull();
        success.Response.Fats.Should().BeNull();
    }

    [Fact]
    public async Task Handle_UnparseableJson_ReturnsModelResponseWasInvalid()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, "not json");

        var result = await handler.Handle(new SuggestNutritionCommand("Cheddar cheese"), CancellationToken.None);

        result.Should().BeOfType<SuggestNutritionResult.Failure>()
            .Which.Error.Should().BeOfType<Error.InternalServerError>();
    }

    private static SuggestNutritionCommandHandler CreateHandler(out FakeChatClient chatClient)
    {
        chatClient = new FakeChatClient();
        return new SuggestNutritionCommandHandler(chatClient, NullLogger<SuggestNutritionCommandHandler>.Instance);
    }

    private static void SetupChatJson(FakeChatClient chatClient, string json)
    {
        chatClient.Response = new ChatResponse(new ChatMessage(ChatRole.Assistant, json));
    }
}
