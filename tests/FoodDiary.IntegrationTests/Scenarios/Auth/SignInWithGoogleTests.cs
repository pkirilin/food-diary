using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.Application.Features.Auth.SignInWithGoogle;
using FoodDiary.Contracts.Auth;
using FoodDiary.Integrations.Google.Extensions;
using FoodDiary.IntegrationTests.Fakes;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace FoodDiary.IntegrationTests.Scenarios.Auth;

public class SignInWithGoogleTests : IClassFixture<FoodDiaryWebApplicationFactory>
{
    private readonly FoodDiaryWebApplicationFactory _webApplicationFactory;

    public SignInWithGoogleTests(FoodDiaryWebApplicationFactory webApplicationFactory)
    {
        _webApplicationFactory = webApplicationFactory;
    }

    [Fact]
    public async Task Authenticates_allowed_user_with_valid_google_token_id_and_provides_access_token()
    {
        var request = new SignInWithGoogleRequest
        {
            GoogleTokenId = "test_google_token_id"
        };

        var client = _webApplicationFactory
            .WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
            {
                var handler = new FakeHttpMessageHandler()
                    .WithGetMethod()
                    .WithPath("/oauth2/v3/tokeninfo")
                    .WithQueryParameter("id_token", request.GoogleTokenId)
                    .WithSuccessStatusCode()
                    .WithJsonResponse(new { email = "test@example.com" });
                
                services.AddGoogleOAuthClient().ConfigurePrimaryHttpMessageHandler(() => handler);
            }))
            .CreateClient();
        
        var response = await client.PostAsJsonAsync("/api/v1/auth/google", request);
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var authResponseData = await response.Content.ReadFromJsonAsync<SuccessfulAuthResponseDto>();
        authResponseData.Should().NotBeNull();
        authResponseData?.AccessToken.Should().NotBeNull();
        authResponseData?.TokenExpirationDays.Should().Be(2);
    }

    [Fact]
    public async Task Denies_access_for_all_requests_with_invalid_google_token_id()
    {
        var request = new SignInWithGoogleRequest
        {
            GoogleTokenId = "test_google_token_id"
        };
        
        var client = _webApplicationFactory
            .WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
            {
                var handler = new FakeHttpMessageHandler()
                    .WithGetMethod()
                    .WithPath("/oauth2/v3/tokeninfo")
                    .WithQueryParameter("id_token", request.GoogleTokenId)
                    .WithBadRequestStatusCode();
                
                services.AddGoogleOAuthClient().ConfigurePrimaryHttpMessageHandler(() => handler);
            }))
            .CreateClient();
        
        var response = await client.PostAsJsonAsync("/api/v1/auth/google", request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        var authResponseMessage = await response.Content.ReadAsStringAsync();
        authResponseMessage.Should().NotBeNull();
    }

    [Fact]
    public async Task Denies_access_for_not_allowed_users_with_valid_google_token_id()
    {
        var request = new SignInWithGoogleRequest
        {
            GoogleTokenId = "test_google_token_id"
        };

        var client = _webApplicationFactory
            .WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
            {
                var handler = new FakeHttpMessageHandler()
                    .WithGetMethod()
                    .WithPath("/oauth2/v3/tokeninfo")
                    .WithQueryParameter("id_token", request.GoogleTokenId)
                    .WithSuccessStatusCode()
                    .WithJsonResponse(new { email = "test@example.com" });

                services.AddGoogleOAuthClient().ConfigurePrimaryHttpMessageHandler(() => handler);
            }))
            .CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/auth/google", request);
        
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        var authResponseMessage = await response.Content.ReadAsStringAsync();
        authResponseMessage.Should().NotBeNull();
    }
}