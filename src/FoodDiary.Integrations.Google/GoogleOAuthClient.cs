using System.Net.Http.Json;
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
        var path = $"/oauth2/v3/tokeninfo?id_token={tokenId}";
        var response = await _httpClient.GetAsync(path, cancellationToken);

        if (!response.IsSuccessStatusCode)
            return null;

        return await response.Content.ReadFromJsonAsync<GoogleTokenInfoDto>(cancellationToken: cancellationToken);
    }
}