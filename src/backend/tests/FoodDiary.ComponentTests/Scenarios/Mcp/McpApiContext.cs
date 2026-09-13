using System.Net;
using System.Text.Json;
using System.Text.Json.Nodes;
using FoodDiary.API.Mcp;
using FoodDiary.API.Mcp.Authorization;
using FoodDiary.ComponentTests.Infrastructure;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

[UsedImplicitly]
public class McpApiContext(FoodDiaryWebApplicationFactory factory) : BaseContext(factory)
{
    // PKCE example values from RFC 7636, Appendix B
    private const string CodeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    private const string CodeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

    private const string State = "af0ifjsldkj";

    private readonly McpOptions _mcpOptions = factory.Services.GetRequiredService<IOptions<McpOptions>>().Value;
    private HttpClient? _oAuthClient;
    private HttpResponseMessage _metadataResponse = null!;
    private HttpResponseMessage _authorizeResponse = null!;
    private string? _authorizationCode;
    private readonly List<HttpResponseMessage> _codeExchangeResponses = [];
    private HttpResponseMessage _refreshResponse = null!;

    private McpClientRegistration Client => _mcpOptions.Clients[0];
    private string McpResource => $"{_mcpOptions.BaseUrl}/mcp";

    private HttpClient OAuthClient => _oAuthClient ??= Factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        AllowAutoRedirect = false
    });

    public Task Given_authorization_code_was_issued()
    {
        var tokenService = Factory.Services.GetRequiredService<McpTokenService>();
        var access = new AccessGrant(Client.ClientId!, "fake.user@gmail.com", "food:read", McpResource);

        _authorizationCode = tokenService.IssueAuthorizationCode(
            new AuthorizationCodeGrant(access, Client.RedirectUri!, CodeChallenge));

        return Task.CompletedTask;
    }

    public async Task When_client_requests_authorization_server_metadata()
    {
        _metadataResponse = await OAuthClient.GetAsync("/.well-known/oauth-authorization-server");
    }

    public Task When_client_requests_authorization()
    {
        return When_client_requests_authorization_with_code_challenge_method("S256");
    }

    public async Task When_client_requests_authorization_with_code_challenge_method(string codeChallengeMethod)
    {
        var authorizeUrl = QueryHelpers.AddQueryString("/authorize", new Dictionary<string, string?>
        {
            ["response_type"] = "code",
            ["client_id"] = Client.ClientId,
            ["redirect_uri"] = Client.RedirectUri,
            ["code_challenge"] = CodeChallenge,
            ["code_challenge_method"] = codeChallengeMethod,
            ["scope"] = "food:read",
            ["resource"] = McpResource,
            ["state"] = State
        });

        _authorizeResponse = await OAuthClient.GetAsync(authorizeUrl);
    }

    public async Task When_client_exchanges_authorization_code()
    {
        _authorizationCode ??= AuthorizationResponseParameter("code");

        var response = await OAuthClient.PostAsync("/token", new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["grant_type"] = "authorization_code",
                ["code"] = _authorizationCode,
                ["redirect_uri"] = Client.RedirectUri!,
                ["code_verifier"] = CodeVerifier,
                ["client_id"] = Client.ClientId!,
                ["client_secret"] = Client.ClientSecret!,
                ["resource"] = McpResource
            }));

        _codeExchangeResponses.Add(response);
    }

    public async Task When_client_refreshes_access_token()
    {
        using var tokens = await ReadJson(_codeExchangeResponses.Single());

        _refreshResponse = await OAuthClient.PostAsync("/token", new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["grant_type"] = "refresh_token",
                ["refresh_token"] = tokens.RootElement.GetProperty("refresh_token").GetString()!,
                ["client_id"] = Client.ClientId!,
                ["client_secret"] = Client.ClientSecret!
            }));
    }

    public Task Then_authorization_response_carries_state_and_issuer()
    {
        AuthorizationResponseParameter("state").Should().Be(State);
        AuthorizationResponseParameter("iss").Should().Be(_mcpOptions.BaseUrl);
        return Task.CompletedTask;
    }

    public Task Then_authorization_error_response_carries_state_and_issuer(string error)
    {
        AuthorizationResponseParameter("error").Should().Be(error);
        AuthorizationResponseParameter("code").Should().BeEmpty();
        AuthorizationResponseParameter("state").Should().Be(State);
        AuthorizationResponseParameter("iss").Should().Be(_mcpOptions.BaseUrl);
        return Task.CompletedTask;
    }

    public async Task Then_client_receives_access_and_refresh_tokens()
    {
        var response = _codeExchangeResponses.Single();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Headers.CacheControl?.NoStore.Should().BeTrue();

        using var tokens = await ReadJson(response);
        tokens.RootElement.GetProperty("access_token").GetString().Should().NotBeNullOrWhiteSpace();
        tokens.RootElement.GetProperty("refresh_token").GetString().Should().NotBeNullOrWhiteSpace();
        tokens.RootElement.GetProperty("token_type").GetString().Should().Be("Bearer");
        tokens.RootElement.GetProperty("expires_in").GetInt32().Should().Be(3600);
    }

    public async Task Then_authorization_server_metadata_is_built_from_base_url()
    {
        _metadataResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        _metadataResponse.Content.Headers.ContentType?.MediaType.Should().Be("application/json");

        var metadata = JsonNode.Parse(await _metadataResponse.Content.ReadAsStringAsync());
        var expectedMetadata = JsonNode.Parse(
            """
            {
              "issuer": "http://localhost",
              "authorization_endpoint": "http://localhost/authorize",
              "token_endpoint": "http://localhost/token",
              "response_types_supported": ["code"],
              "grant_types_supported": ["authorization_code", "refresh_token"],
              "code_challenge_methods_supported": ["S256"],
              "token_endpoint_auth_methods_supported": ["client_secret_post"],
              "scopes_supported": ["food:read"],
              "authorization_response_iss_parameter_supported": true
            }
            """);

        JsonNode.DeepEquals(metadata, expectedMetadata)
            .Should().BeTrue("metadata must match RFC 8414 document in the spec, but was {0}", metadata?.ToJsonString());
    }

    public async Task Then_client_receives_new_access_token()
    {
        _refreshResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        using var tokens = await ReadJson(_refreshResponse);
        tokens.RootElement.GetProperty("access_token").GetString().Should().NotBeNullOrWhiteSpace();
        tokens.RootElement.GetProperty("token_type").GetString().Should().Be("Bearer");
        tokens.RootElement.GetProperty("expires_in").GetInt32().Should().Be(3600);
    }

    public async Task Then_only_the_first_code_exchange_succeeds()
    {
        _codeExchangeResponses.Select(response => response.StatusCode)
            .Should().Equal(HttpStatusCode.OK, HttpStatusCode.BadRequest);

        using var error = await ReadJson(_codeExchangeResponses[1]);
        error.RootElement.GetProperty("error").GetString().Should().Be("invalid_grant");
    }

    private static async Task<JsonDocument> ReadJson(HttpResponseMessage response) =>
        JsonDocument.Parse(await response.Content.ReadAsStringAsync());

    private string AuthorizationResponseParameter(string name)
    {
        _authorizeResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);

        var location = _authorizeResponse.Headers.Location!;
        location.GetLeftPart(UriPartial.Path).Should().Be(Client.RedirectUri);

        return QueryHelpers.ParseQuery(location.Query).GetValueOrDefault(name).ToString();
    }
}
