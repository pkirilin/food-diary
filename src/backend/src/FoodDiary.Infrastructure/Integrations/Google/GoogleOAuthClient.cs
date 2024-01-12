using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Auth.GetUserProfile;
using FoodDiary.Configuration;
using Microsoft.Extensions.Options;

namespace FoodDiary.Infrastructure.Integrations.Google;

public class GoogleOAuthClient : IOAuthClient
{
    private readonly HttpClient _httpClient;
    private readonly IOptions<GoogleAuthOptions> _options;

    public GoogleOAuthClient(HttpClient httpClient, IOptions<GoogleAuthOptions> options)
    {
        _httpClient = httpClient;
        _options = options;
    }

    public async Task<RefreshTokenResult> RefreshToken(string currentRefreshToken, CancellationToken cancellationToken)
    {
        var formValues = new List<KeyValuePair<string, string>>
        {
            new("grant_type", "refresh_token"),
            new("client_id", _options.Value.ClientId),
            new("client_secret", _options.Value.ClientSecret),
            new("refresh_token", currentRefreshToken),
            new("scope", "openid profile email")
        };

        var request = new HttpRequestMessage(HttpMethod.Post, _options.Value.TokenEndpoint)
        {
            Content = new FormUrlEncodedContent(formValues)
        };

        var response = await _httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return new RefreshTokenResult.Error();
        }

        var content = await response.Content.ReadFromJsonAsync<RefreshTokenResult.Success>(cancellationToken);

        return content;
    }

    public async Task<GetUserInfoResult> GetUserInfo(string accessToken, CancellationToken cancellationToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, _options.Value.UserInformationEndpoint)
        {
            Headers =
            {
                Authorization = new AuthenticationHeaderValue("Bearer", accessToken)
            }
        };
        
        var response = await _httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return new GetUserInfoResult.Error();
        }

        var content = await response.Content.ReadFromJsonAsync<GetUserInfoResult.Success>(cancellationToken);

        return content;
    }
}