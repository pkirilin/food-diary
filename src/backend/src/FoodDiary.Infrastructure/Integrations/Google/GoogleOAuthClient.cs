using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Auth.GetStatus;
using FoodDiary.Configuration;
using Microsoft.Extensions.Options;

namespace FoodDiary.Infrastructure.Integrations.Google;

public class GoogleOAuthClient(HttpClient httpClient, IOptions<GoogleAuthOptions> options) : IOAuthClient
{
    public async Task<RefreshTokenResult> RefreshToken(string refreshToken, CancellationToken cancellationToken)
    {
        var formValues = new List<KeyValuePair<string, string>>
        {
            new("grant_type", "refresh_token"),
            new("client_id", options.Value.ClientId),
            new("client_secret", options.Value.ClientSecret),
            new("refresh_token", refreshToken),
            new("scope", $"{Constants.AuthenticationScopes.Openid} " +
                         $"{Constants.AuthenticationScopes.Profile} " +
                         $"{Constants.AuthenticationScopes.Email} " +
                         $"{Constants.AuthenticationScopes.GoogleDocs} " +
                         $"{Constants.AuthenticationScopes.GoogleDrive}")
        };

        var request = new HttpRequestMessage(HttpMethod.Post, options.Value.TokenEndpoint)
        {
            Content = new FormUrlEncodedContent(formValues)
        };

        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return new RefreshTokenResult.Error();
        }

        var content = await response.Content.ReadFromJsonAsync<RefreshTokenResult.Success>(cancellationToken);

        return content;
    }

    public async Task<GetUserInfoResult> GetUserInfo(string accessToken, CancellationToken cancellationToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, options.Value.UserInformationEndpoint)
        {
            Headers =
            {
                Authorization = new AuthenticationHeaderValue("Bearer", accessToken)
            }
        };
        
        var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return new GetUserInfoResult.Error();
        }

        var content = await response.Content.ReadFromJsonAsync<GetUserInfoResult.Success>(cancellationToken);

        return content;
    }
}