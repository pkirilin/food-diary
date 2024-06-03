using FoodDiary.Integrations.OpenAI.Contracts;

namespace FoodDiary.Integrations.OpenAI;

public interface IOpenAiApiClient
{
    Task<CreateChatCompletionResponse> CreateChatCompletion(
        CreateChatCompletionRequest request,
        CancellationToken cancellationToken);
}