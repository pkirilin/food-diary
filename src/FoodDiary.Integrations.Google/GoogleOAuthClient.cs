using System.Net.Http.Json;
using FoodDiary.Domain.Exceptions;
using FoodDiary.Integrations.Google.Contracts;

namespace FoodDiary.Integrations.Google;

internal class GoogleOAuthClient : IGoogleOAuthClient
{
    private readonly HttpClient _httpClient;

    public GoogleOAuthClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    
    public async Task<GoogleTokenInfoDto> ValidateTokenAsync(string tokenId, CancellationToken cancellationToken)
    {
        var response = await _httpClient.GetAsync("/oauth2/v3/tokeninfo", cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new AccessDeniedException("Google token is invalid");
        }

        return await response.Content.ReadFromJsonAsync<GoogleTokenInfoDto>(cancellationToken: cancellationToken);
    }
}