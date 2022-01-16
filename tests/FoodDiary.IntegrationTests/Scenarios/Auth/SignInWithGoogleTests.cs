using System;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.Application.Features.Auth.SignInWithGoogle;
using FoodDiary.Contracts.Auth;
using FoodDiary.IntegrationTests.MockApis;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using Xunit;

namespace FoodDiary.IntegrationTests.Scenarios.Auth;

[Collection("Tests with WireMock")]
public class SignInWithGoogleTests : IDisposable,
    IClassFixture<FoodDiaryApplicationFactory>,
    IClassFixture<GoogleMockApi>
{
    private readonly FoodDiaryApplicationFactory _applicationFactory;
    private readonly GoogleMockApi _googleMockApi;

    public SignInWithGoogleTests(FoodDiaryApplicationFactory applicationFactory, GoogleMockApi googleMockApi)
    {
        _applicationFactory = applicationFactory;
        _googleMockApi = googleMockApi;
    }
    
    public void Dispose()
    {
        _googleMockApi.Server.Reset();
    }

    [Fact]
    public async Task Authenticates_allowed_user_with_valid_google_token_id_and_provides_access_token()
    {
        var client = _applicationFactory.CreateClient();
        var request = new SignInWithGoogleRequest
        {
            GoogleTokenId = "test_google_token_id"
        };
        Setup_GoogleApi_to_validate_test_token_successfully("test_google_token_id", "test@example.com");
        
        var response = await client.PostAsJsonAsync("/api/v1/auth/google", request);
        
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var authResponseData = await response.Content.ReadFromJsonAsync<SuccessfulAuthResponseDto>();
        authResponseData.Should().NotBeNull();
        authResponseData?.AccessToken.Should().NotBeNull();
    }

    [Fact]
    public async Task Denies_access_for_all_requests_with_invalid_google_token_id()
    {
        var client = _applicationFactory.CreateClient();
        var request = new SignInWithGoogleRequest
        {
            GoogleTokenId = "test_google_token_id"
        };
        Setup_GoogleApi_to_validate_test_token_with_error("test_google_token_id");
        
        var response = await client.PostAsJsonAsync("/api/v1/auth/google", request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        var authResponseMessage = await response.Content.ReadAsStringAsync();
        authResponseMessage.Should().NotBeNull();
    }

    [Fact]
    public async Task Denies_access_for_not_allowed_users_with_valid_google_token_id()
    {
        var client = _applicationFactory.CreateClient();
        var request = new SignInWithGoogleRequest
        {
            GoogleTokenId = "test_google_token_id"
        };
        Setup_GoogleApi_to_validate_test_token_successfully("test_google_token_id", "test2@example.com");
        
        var response = await client.PostAsJsonAsync("/api/v1/auth/google", request);
        
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        var authResponseMessage = await response.Content.ReadAsStringAsync();
        authResponseMessage.Should().NotBeNull();
    }

    private void Setup_GoogleApi_to_validate_test_token_successfully(string googleTokenId, string returnedEmail)
    {
        var responseBody = JsonSerializer.Serialize(new
        {
            email = returnedEmail
        });
        
        _googleMockApi.Server
            .Given(Request.Create()
                .UsingGet()
                .WithPath("/oauth2/v3/tokeninfo")
                .WithParam("id_token", googleTokenId)
            )
            .RespondWith(Response.Create()
                .WithSuccess()
                .WithBody(responseBody)
            );
    }
    
    private void Setup_GoogleApi_to_validate_test_token_with_error(string googleTokenId)
    {
        var responseBody = JsonSerializer.Serialize(new
        {
            error_description = "some error message"
        });
        
        _googleMockApi.Server
            .Given(Request.Create()
                .UsingGet()
                .WithPath("/oauth2/v3/tokeninfo")
                .WithParam("id_token", googleTokenId)
            )
            .RespondWith(Response.Create()
                .WithStatusCode(HttpStatusCode.BadRequest)
                .WithBody(responseBody)
            );
    }
}