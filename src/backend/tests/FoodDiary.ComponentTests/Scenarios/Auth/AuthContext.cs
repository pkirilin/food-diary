using System.Net;
using System.Net.Http.Json;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Contracts.Auth;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Scenarios.Auth;

public class AuthContext(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : BaseContext(factory, infrastructure)
{
    private HttpResponseMessage? _response;
    private GetAuthStatusResponse? _getStatusResponse;

    public Task Given_authenticated_user_with_expired_access_token()
    {
        var timeProvider = Factory.Services.GetRequiredService<TimeProvider>();

        Factory = WithAuthenticatedUser(
            tokenIssuedOn: timeProvider.GetUtcNow()
                .Subtract(Constants.AuthenticationParameters.AccessTokenRefreshInterval)
                .Subtract(TimeSpan.FromMinutes(15)));

        return Task.CompletedTask;
    }

    public Task Given_google_identity_provider_is_ready()
    {
        return Infrastructure.ExternalServices.GoogleIdentityProvider.Start();
    }

    public Task Given_user_access_token_can_be_refreshed()
    {
        return Infrastructure.ExternalServices.GoogleIdentityProvider.SetupAccessTokenSuccessfullyRefreshed();
    }

    public Task Given_user_info_can_be_retrieved()
    {
        return Infrastructure.ExternalServices.GoogleIdentityProvider.SetupUserInfoSuccessfullyReceived();
    }

    public async Task When_user_is_trying_to_access_resource(string resource)
    {
        _response = await ApiClient.GetAsync(resource);
    }

    public async Task When_client_checks_auth_status()
    {
        _getStatusResponse = await ApiClient.GetFromJsonAsync<GetAuthStatusResponse>("/api/v1/auth/status");
    }

    public Task Then_access_is_forbidden()
    {
        _response!.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        return Task.CompletedTask;
    }

    public Task Then_user_is_authenticated()
    {
        _getStatusResponse?.IsAuthenticated.Should().BeTrue();
        return Task.CompletedTask;
    }
}