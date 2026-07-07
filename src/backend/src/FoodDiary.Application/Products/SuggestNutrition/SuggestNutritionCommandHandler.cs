using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;

namespace FoodDiary.Application.Products.SuggestNutrition;

public record SuggestNutritionCommand(string Name);

public class SuggestNutritionCommandHandler(IChatClient chatClient, ILogger<SuggestNutritionCommandHandler> logger)
{
    private const string SystemPrompt =
        """
        You estimate nutrition facts for a calorie tracker. Return strictly the JSON schema you are given. Numbers must be numeric (never strings, never "null"). All energy values are kilocalories (kcal), never joules.
        """;

    public async Task<SuggestNutritionResult> Handle(SuggestNutritionCommand command, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.Name))
        {
            return SuggestNutritionResult.NameIsRequired();
        }

        var systemMessage = new ChatMessage(ChatRole.System, SystemPrompt);
        var userMessage = new ChatMessage(ChatRole.User, BuildUserPrompt(command.Name));

        var chatResponse = await chatClient.GetResponseAsync<SuggestedNutrition>(
            messages: [systemMessage, userMessage],
            cancellationToken: cancellationToken);

        if (!chatResponse.TryGetResult(out var modelResponse))
        {
            logger.LogError("Could not deserialize model response {ModelResponse}", chatResponse.Text);
            return SuggestNutritionResult.ModelResponseWasInvalid();
        }

        return new SuggestNutritionResult.Success(modelResponse.ToSuggestNutritionResponse());
    }

    private static string BuildUserPrompt(string name) =>
        $"""
        Estimate typical nutrition facts per 100 g for the product named "{name}" from your own general knowledge of that product.

        All energy/nutrient values are per 100 g. Calories are kilocalories (kcal), never joules. Provide calories and every nutrient you can reasonably estimate. Set a field to null only if you genuinely cannot estimate it.
        """;
}
