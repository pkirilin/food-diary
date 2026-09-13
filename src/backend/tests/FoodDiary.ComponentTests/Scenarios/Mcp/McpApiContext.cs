using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using FoodDiary.API.Mcp;
using FoodDiary.API.Mcp.Authorization;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.Entities;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using ModelContextProtocol.Client;
using ModelContextProtocol.Protocol;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

[UsedImplicitly]
public class McpApiContext(FoodDiaryWebApplicationFactory factory) : BaseContext(factory)
{
    // PKCE example values from RFC 7636, Appendix B
    private const string CodeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    private const string CodeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

    private const string State = "af0ifjsldkj";

    private const string AllowedUserEmail = "fake.user@gmail.com";

    private readonly McpOptions _mcpOptions = factory.Services.GetRequiredService<IOptions<McpOptions>>().Value;
    private HttpClient? _oAuthClient;
    private HttpResponseMessage _metadataResponse = null!;
    private HttpResponseMessage _authorizeResponse = null!;
    private string? _authorizationCode;
    private readonly List<HttpResponseMessage> _codeExchangeResponses = [];
    private HttpResponseMessage _refreshResponse = null!;
    private HttpResponseMessage _mcpResponse = null!;
    private HttpResponseMessage _resourceMetadataResponse = null!;
    private string? _accessToken;
    private Implementation _connectedServer = null!;
    private List<string> _listedToolNames = [];
    private CallToolResult _toolResult = null!;

    private McpClientRegistration Client => _mcpOptions.Clients[0];
    private string McpResource => _mcpOptions.McpResource;
    private McpTokenService TokenService => Factory.Services.GetRequiredService<McpTokenService>();

    private HttpClient OAuthClient => _oAuthClient ??= Factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        AllowAutoRedirect = false
    });

    public Task Given_authorization_code_was_issued()
    {
        _authorizationCode = TokenService.IssueAuthorizationCode(
            new AuthorizationCodeGrant(AccessGrantFor(AllowedUserEmail), Client.RedirectUri!, CodeChallenge));

        return Task.CompletedTask;
    }

    public Task Given_access_token_was_issued()
    {
        return Given_access_token_was_issued_to(AllowedUserEmail);
    }

    public Task Given_access_token_was_issued_to(string email)
    {
        _accessToken = TokenService.IssueAccessToken(AccessGrantFor(email));
        return Task.CompletedTask;
    }

    public Task Given_notes(params Note[] notes)
    {
        return Factory.SeedDataAsync(notes);
    }

    public async Task When_mcp_client_connects()
    {
        await using var mcpClient = await ConnectMcpClient();
        _connectedServer = mcpClient.ServerInfo;
    }

    public async Task When_mcp_client_calls_get_food_logs(string from, string to)
    {
        await using var mcpClient = await ConnectMcpClient();

        var tools = await mcpClient.ListToolsAsync();
        _listedToolNames = tools.Select(tool => tool.Name).ToList();

        _toolResult = await tools.Single(tool => tool.Name == "get_food_logs").CallAsync(
            new Dictionary<string, object?>
            {
                ["from"] = from,
                ["to"] = to
            });
    }

    public async Task When_client_requests_authorization_server_metadata()
    {
        _metadataResponse = await OAuthClient.GetAsync("/.well-known/oauth-authorization-server");
    }

    public Task When_client_calls_mcp_without_access_token()
    {
        return CallMcp(accessToken: null);
    }

    public Task When_client_calls_mcp_with_access_token()
    {
        return CallMcp(_accessToken);
    }

    private async Task CallMcp(string? accessToken)
    {
        var initializeRequest = new HttpRequestMessage(HttpMethod.Post, "/mcp")
        {
            Content = new StringContent(
                """
                {
                  "jsonrpc": "2.0",
                  "id": 1,
                  "method": "initialize",
                  "params": {
                    "protocolVersion": "2025-11-25",
                    "capabilities": {},
                    "clientInfo": { "name": "component-tests", "version": "1.0.0" }
                  }
                }
                """,
                Encoding.UTF8,
                "application/json")
        };

        initializeRequest.Headers.Accept.ParseAdd("application/json");
        initializeRequest.Headers.Accept.ParseAdd("text/event-stream");

        if (accessToken is not null)
        {
            initializeRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        }

        _mcpResponse = await OAuthClient.SendAsync(initializeRequest);
    }

    public async Task When_client_requests_resource_metadata_from_challenge()
    {
        var challengeParameters = _mcpResponse.Headers.WwwAuthenticate.FirstOrDefault()?.Parameter ?? string.Empty;
        var resourceMetadataUrl = Regex.Match(challengeParameters, "resource_metadata=\"([^\"]+)\"").Groups[1].Value;

        _resourceMetadataResponse = await OAuthClient.GetAsync(resourceMetadataUrl);
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

    public Task Then_client_is_challenged_with_resource_metadata_and_scope()
    {
        _mcpResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        _mcpResponse.Headers.WwwAuthenticate.Select(challenge => challenge.ToString()).Should().Equal(
            """
            Bearer resource_metadata="http://localhost/.well-known/oauth-protected-resource/mcp", scope="food:read"
            """);

        return Task.CompletedTask;
    }

    public Task Then_access_is_forbidden()
    {
        _mcpResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        return Task.CompletedTask;
    }

    public Task Then_mcp_client_is_connected()
    {
        _connectedServer.Name.Should().NotBeNullOrWhiteSpace();
        return Task.CompletedTask;
    }

    public async Task Then_resource_metadata_is_built_from_base_url()
    {
        _resourceMetadataResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        _resourceMetadataResponse.Content.Headers.ContentType?.MediaType.Should().Be("application/json");

        using var metadata = await ReadJson(_resourceMetadataResponse);
        metadata.RootElement.GetProperty("resource").GetString().Should().Be("http://localhost/mcp");
        metadata.RootElement.GetProperty("authorization_servers").EnumerateArray()
            .Select(server => server.GetString()).Should().Equal("http://localhost");
        metadata.RootElement.GetProperty("scopes_supported").EnumerateArray()
            .Select(scope => scope.GetString()).Should().Equal("food:read");
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

    public Task Then_food_logs_contain(Note note)
    {
        _listedToolNames.Should().Contain("get_food_logs");
        _toolResult.IsError.Should().NotBe(true);

        using var foodLogs = JsonDocument.Parse(ToolResultText());
        var day = foodLogs.RootElement.GetProperty("days").EnumerateArray().Single();
        day.GetProperty("date").GetString().Should().Be(note.Date.ToString("yyyy-MM-dd"));

        var item = day.GetProperty("meals").EnumerateArray().Single().GetProperty("items").EnumerateArray().Single();
        item.GetProperty("product").GetProperty("name").GetString().Should().Be(note.Product!.Name);
        item.GetProperty("quantity").GetInt32().Should().Be(note.ProductQuantity);

        return Task.CompletedTask;
    }

    public Task Then_tool_call_is_error(string message)
    {
        _toolResult.IsError.Should().BeTrue();
        ToolResultText().Should().Contain(message);
        return Task.CompletedTask;
    }

    private async Task<McpClient> ConnectMcpClient()
    {
        var transport = new HttpClientTransport(
            new HttpClientTransportOptions
            {
                Endpoint = new Uri(McpResource),
                TransportMode = HttpTransportMode.StreamableHttp,
                AdditionalHeaders = new Dictionary<string, string>
                {
                    ["Authorization"] = $"Bearer {_accessToken}"
                }
            },
            Factory.CreateClient());

        return await McpClient.CreateAsync(transport);
    }

    private string ToolResultText() => _toolResult.Content.OfType<TextContentBlock>().Single().Text;

    private AccessGrant AccessGrantFor(string email) => new(Client.ClientId!, email, "food:read", McpResource);

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
