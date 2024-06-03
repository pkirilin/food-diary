using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using FoodDiary.Integrations.OpenAI.Contracts;

namespace FoodDiary.Integrations.OpenAI;

internal class OpenAiApiClient(HttpClient httpClient) : IOpenAiApiClient
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };
    
    public async Task<CreateChatCompletionResponse> CreateChatCompletion(
        CreateChatCompletionRequest request,
        CancellationToken cancellationToken)
    {
        var content = new StringContent(
            JsonSerializer.Serialize(request, SerializerOptions),
            Encoding.UTF8,
            "application/json");
        
        var httpResponse = await httpClient.PostAsync("/v1/chat/completions", content, cancellationToken);

        var response = await httpResponse.Content.ReadFromJsonAsync<CreateChatCompletionResponse>(
            SerializerOptions,
            cancellationToken);

        return response ?? new CreateChatCompletionResponse
        {
            Choices = []
        };
    }
}