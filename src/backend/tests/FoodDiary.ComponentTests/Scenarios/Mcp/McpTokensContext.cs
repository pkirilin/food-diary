using System.Net;
using System.Text.Json;
using FoodDiary.API.Mcp.Authorization;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using JetBrains.Annotations;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

[UsedImplicitly]
public class McpTokensContext(FoodDiaryWebApplicationFactory factory, ExternalServicesFixture externalServices)
    : McpContext(factory, externalServices)
{
    private string? _authorizationCode;
    private readonly List<HttpResponseMessage> _refreshResponses = [];

    public Task Given_authorization_code_was_issued()
    {
        _authorizationCode = TokenService.IssueAuthorizationCode(
            new AuthorizationCodeGrant(AccessGrantFor(AllowedUserEmail), Client.RedirectUri!, CodeChallenge));

        return Task.CompletedTask;
    }

    public Task Given_refresh_token_was_issued_before_rotation()
    {
        var preRotationPayload = JsonSerializer.Serialize(new
        {
            Grant = AccessGrantFor(AllowedUserEmail),
            ExpiresAt = Clock.GetUtcNow() + McpOptions.RefreshTokenLifetime
        });

        IssuedRefreshTokens.Add(Factory.Services.GetRequiredService<IDataProtectionProvider>()
            .CreateProtector("FoodDiary.Mcp.RefreshToken")
            .Protect(preRotationPayload));

        return Task.CompletedTask;
    }

    public Task Given_refresh_token_was_issued_but_never_recorded()
    {
        IssuedRefreshTokens.Add(TokenService.IssueTokens(AccessGrantFor(AllowedUserEmail)).RefreshToken.Value);
        return Task.CompletedTask;
    }

    public Task When_days_pass(int days)
    {
        Clock.Advance(TimeSpan.FromDays(days));
        return Task.CompletedTask;
    }

    public Task When_client_requests_authorization()
    {
        return When_client_requests_authorization_with_code_challenge_method("S256");
    }

    public async Task When_cimd_client_exchanges_authorization_code_with_client_secret(string clientSecret)
    {
        await ExchangeAuthorizationCode(await CimdAuthorizationCode(), CimdRedirectUri, CimdClientId, clientSecret);
    }

    public async Task When_cimd_client_exchanges_authorization_code_without_code_verifier()
    {
        await ExchangeAuthorizationCode(
            await CimdAuthorizationCode(),
            CimdRedirectUri,
            CimdClientId,
            clientSecret: null,
            codeVerifier: null);
    }

    public Task When_client_exchanges_authorization_code()
    {
        _authorizationCode ??= AuthorizationResponseParameter("code");

        return ExchangeAuthorizationCode(_authorizationCode, Client.RedirectUri!, Client.ClientId!, Client.ClientSecret);
    }

    public Task When_client_exchanges_authorization_code_as(string clientId, string? clientSecret)
    {
        return ExchangeAuthorizationCode(_authorizationCode!, Client.RedirectUri!, clientId, clientSecret);
    }

    public Task When_client_refreshes_access_token()
    {
        return RefreshAccessToken(IssuedRefreshTokens[^1]);
    }

    public Task When_client_refreshes_access_token_with_first_refresh_token()
    {
        return RefreshAccessToken(IssuedRefreshTokens[0]);
    }

    public async Task When_client_refreshes_access_token_twice_at_once()
    {
        var refreshToken = IssuedRefreshTokens[^1];
        var responses = await Task.WhenAll(SendRefreshRequest(refreshToken), SendRefreshRequest(refreshToken));

        foreach (var response in responses)
        {
            _refreshResponses.Add(await RecordIssuedTokens(response));
        }
    }

    public async Task When_cimd_client_refreshes_access_token()
    {
        var response = await SendRefreshRequest(IssuedRefreshTokens[^1], CimdClientId, clientSecret: null);
        _refreshResponses.Add(await RecordIssuedTokens(response));
    }

    private async Task RefreshAccessToken(string refreshToken)
    {
        _refreshResponses.Add(await RecordIssuedTokens(await SendRefreshRequest(refreshToken)));
    }

    private Task<HttpResponseMessage> SendRefreshRequest(string refreshToken)
    {
        return SendRefreshRequest(refreshToken, Client.ClientId!, Client.ClientSecret);
    }

    private Task<HttpResponseMessage> SendRefreshRequest(string refreshToken, string clientId, string? clientSecret)
    {
        return RequestTokens(new Dictionary<string, string?>
        {
            ["grant_type"] = "refresh_token",
            ["refresh_token"] = refreshToken,
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret
        });
    }

    public Task Then_authorization_response_carries_state_and_issuer()
    {
        AuthorizationResponseParameter("state").Should().Be(State);
        AuthorizationResponseParameter("iss").Should().Be(McpOptions.BaseUrl);
        return Task.CompletedTask;
    }

    public async Task Then_client_receives_new_access_and_refresh_tokens()
    {
        var response = _refreshResponses.Single();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Headers.CacheControl?.NoStore.Should().BeTrue();

        using var tokens = await ReadJson(response);
        tokens.RootElement.GetProperty("access_token").GetString().Should().NotBeNullOrWhiteSpace();
        tokens.RootElement.GetProperty("token_type").GetString().Should().Be("Bearer");
        tokens.RootElement.GetProperty("expires_in").GetInt32().Should().Be(3600);
        IssuedRefreshTokens.Should().HaveCount(2).And.OnlyHaveUniqueItems();
    }

    public async Task Then_only_the_first_refresh_succeeds()
    {
        _refreshResponses[0].StatusCode.Should().Be(HttpStatusCode.OK);

        foreach (var response in _refreshResponses.Skip(1))
        {
            await ShouldBeInvalidGrant(response);
        }
    }

    public async Task Then_only_one_refresh_succeeds()
    {
        _refreshResponses.Should().ContainSingle(response => response.StatusCode == HttpStatusCode.OK);

        foreach (var response in _refreshResponses.Where(response => response.StatusCode != HttpStatusCode.OK))
        {
            await ShouldBeInvalidGrant(response);
        }
    }

    public async Task Then_client_authentication_fails_with(string description)
    {
        var response = CodeExchangeResponses.Single();
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        using var error = await ReadJson(response);
        error.RootElement.GetProperty("error").GetString().Should().Be("invalid_client");
        error.RootElement.GetProperty("error_description").GetString().Should().Be(description);
    }

    public Task Then_code_exchange_is_refused()
    {
        return ShouldBeInvalidGrant(CodeExchangeResponses.Single());
    }

    public Task Then_refresh_is_refused()
    {
        return ShouldBeInvalidGrant(_refreshResponses.Single());
    }

    private static async Task ShouldBeInvalidGrant(HttpResponseMessage response)
    {
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        using var error = await ReadJson(response);
        error.RootElement.GetProperty("error").GetString().Should().Be("invalid_grant");
    }

    public Task Then_every_refresh_returns_new_refresh_token()
    {
        _refreshResponses.Select(response => response.StatusCode).Should().AllBeEquivalentTo(HttpStatusCode.OK);
        IssuedRefreshTokens.Should().HaveCount(_refreshResponses.Count + 1).And.OnlyHaveUniqueItems();
        return Task.CompletedTask;
    }

    public async Task Then_only_the_first_code_exchange_succeeds()
    {
        CodeExchangeResponses.Select(response => response.StatusCode)
            .Should().Equal(HttpStatusCode.OK, HttpStatusCode.BadRequest);

        using var error = await ReadJson(CodeExchangeResponses[1]);
        error.RootElement.GetProperty("error").GetString().Should().Be("invalid_grant");
    }
}
