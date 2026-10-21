using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using FoodDiary.API;
using FoodDiary.API.Mcp;
using FoodDiary.API.Mcp.Authorization;
using FoodDiary.API.Mcp.Authorization.Cimd;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.DateAndTime;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using FoodDiary.Domain.Entities;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using ModelContextProtocol.Client;
using ModelContextProtocol.Protocol;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

public abstract class McpContext : BaseContext
{
    // PKCE example values from RFC 7636, Appendix B
    private const string CodeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    protected const string CodeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

    protected const string State = "af0ifjsldkj";

    protected const string AllowedUserEmail = "fake.user@gmail.com";

    protected const string CimdDocumentPath = "/oauth-client.json";
    protected const string CimdClientName = "Test MCP Client";
    private const string CimdLogoUri = "https://client.example.com/logo.png";
    protected const string CimdRedirectUri = "http://127.0.0.1:1456/callback";
    protected static readonly string CimdClientId = McpClientMetadataHost.UrlOf(CimdDocumentPath);

    private readonly ExternalServicesFixture _externalServices;

    // Each Factory.WithWebHostBuilder starts another host; these keep the hosts of one scenario a single server
    protected readonly AdjustableDateTimeProvider Clock = new();
    private readonly MemoryCache _memoryCache = new(new MemoryCacheOptions());

    private readonly WebApplicationFactory<Startup> _hostWithoutOwnerSignIn;

    private HttpClient? _oAuthClient;
    protected HttpResponseMessage AuthorizeResponse = null!;
    protected string? ConsentRequest;
    protected readonly List<HttpResponseMessage> ConsentDecisionResponses = [];
    protected readonly List<HttpResponseMessage> CodeExchangeResponses = [];
    protected readonly List<string> IssuedRefreshTokens = [];
    protected HttpResponseMessage McpResponse = null!;
    protected string? AccessToken;
    protected List<string> ListedToolNames = [];
    protected CallToolResult ToolResult = null!;

    protected McpOptions McpOptions { get; }
    protected McpClientMetadataHost MetadataHost => _externalServices.McpClientMetadataHost;
    protected McpClientRegistration Client => McpOptions.Clients[0];
    protected string McpResource => McpOptions.McpResource;
    protected McpTokenService TokenService => Factory.Services.GetRequiredService<McpTokenService>();

    protected HttpClient OAuthClient => _oAuthClient ??= Factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        AllowAutoRedirect = false
    });

    protected McpContext(FoodDiaryWebApplicationFactory factory, ExternalServicesFixture externalServices) : base(factory)
    {
        McpOptions = factory.Services.GetRequiredService<IOptions<McpOptions>>().Value;
        _externalServices = externalServices;

        Factory = factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
        {
            services.AddSingleton<TimeProvider>(Clock);
            services.AddSingleton<IMemoryCache>(_memoryCache);
        }));

        _hostWithoutOwnerSignIn = Factory;
    }

    public async Task Given_cimd_client_metadata_document()
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupDocument(CimdDocumentPath, CimdDocument());
    }

    public Task Given_cimd_client_metadata_document_with(string field, object value)
    {
        var document = CimdDocument();
        document[field] = value;

        return ServeCimdDocument(document);
    }

    public Task Given_products(params Product[] products)
    {
        return Factory.SeedDataAsync(products);
    }

    public Task When_mcp_client_calls_list_products(string productName)
    {
        return When_mcp_client_calls_listed_tool("list_products", new Dictionary<string, object?>
        {
            ["pageNumber"] = 1,
            ["pageSize"] = 100,
            ["productName"] = productName
        });
    }

    protected async Task When_mcp_client_calls_listed_tool(string toolName, Dictionary<string, object?> arguments)
    {
        await using var mcpClient = await ConnectMcpClient();

        var tools = await mcpClient.ListToolsAsync();
        ListedToolNames = tools.Select(tool => tool.Name).ToList();

        ToolResult = await tools.Single(tool => tool.Name == toolName).CallAsync(arguments);
    }

    protected async Task CallMcp(string? accessToken)
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

        McpResponse = await OAuthClient.SendAsync(initializeRequest);
    }

    public Task When_client_requests_authorization_with_code_challenge_method(string codeChallengeMethod)
    {
        var parameters = AuthorizationParameters(Client.ClientId!, Client.RedirectUri!);
        parameters["code_challenge_method"] = codeChallengeMethod;

        return RequestAuthorization(parameters);
    }

    public Task When_cimd_client_requests_authorization()
    {
        return RequestAuthorization(AuthorizationParameters(CimdClientId, CimdRedirectUri));
    }

    public Task When_cimd_client_requests_authorization_with(string parameter, string? value)
    {
        var parameters = AuthorizationParameters(CimdClientId, CimdRedirectUri);
        parameters[parameter] = value;

        return RequestAuthorization(parameters);
    }

    private Dictionary<string, string?> AuthorizationParameters(string clientId, string redirectUri) => new()
    {
        ["response_type"] = "code",
        ["client_id"] = clientId,
        ["redirect_uri"] = redirectUri,
        ["code_challenge"] = CodeChallenge,
        ["code_challenge_method"] = "S256",
        ["scope"] = "food:read",
        ["resource"] = McpResource,
        ["state"] = State
    };

    private async Task RequestAuthorization(Dictionary<string, string?> parameters)
    {
        AuthorizeResponse = await OAuthClient.GetAsync(QueryHelpers.AddQueryString("/authorize", parameters));
    }

    public Task When_owner_approves_consent()
    {
        return DecideOnConsent(approved: true);
    }

    protected Task DecideOnConsent(bool approved)
    {
        ConsentRequest ??= ConsentRequestFromRedirect();

        return RecordConsentDecision(OAuthClient.PostAsJsonAsync("/authorize/consent", new
        {
            consentRequest = ConsentRequest,
            approved
        }));
    }

    protected async Task RecordConsentDecision(Task<HttpResponseMessage> decision)
    {
        ConsentDecisionResponses.Add(await decision);
    }

    protected Task SignInOnNewHost(string email)
    {
        Factory = _hostWithoutOwnerSignIn;
        _oAuthClient = null;

        return Given_authenticated_user(email);
    }

    public async Task When_cimd_client_exchanges_authorization_code()
    {
        await ExchangeAuthorizationCode(await CimdAuthorizationCode(), CimdRedirectUri, CimdClientId, clientSecret: null);
    }

    protected async Task ExchangeAuthorizationCode(
        string code,
        string redirectUri,
        string clientId,
        string? clientSecret,
        string? codeVerifier = CodeVerifier)
    {
        var response = await RequestTokens(new Dictionary<string, string?>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = code,
            ["redirect_uri"] = redirectUri,
            ["code_verifier"] = codeVerifier,
            ["client_id"] = clientId,
            ["client_secret"] = clientSecret,
            ["resource"] = McpResource
        });

        CodeExchangeResponses.Add(await RecordIssuedTokens(response));
    }

    protected Task<HttpResponseMessage> RequestTokens(Dictionary<string, string?> parameters)
    {
        var sentParameters = parameters
            .Where(parameter => parameter.Value is not null)
            .ToDictionary(parameter => parameter.Key, parameter => parameter.Value!);

        return OAuthClient.PostAsync("/token", new FormUrlEncodedContent(sentParameters));
    }

    protected async Task<HttpResponseMessage> RecordIssuedTokens(HttpResponseMessage tokenResponse)
    {
        if (tokenResponse.IsSuccessStatusCode)
        {
            using var tokens = await ReadJson(tokenResponse);
            AccessToken = tokens.RootElement.GetProperty("access_token").GetString();

            if (tokens.RootElement.TryGetProperty("refresh_token", out var refreshToken))
            {
                IssuedRefreshTokens.Add(refreshToken.GetString()!);
            }
        }

        return tokenResponse;
    }

    public async Task Then_authorization_is_refused_with(string reason)
    {
        AuthorizeResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        AuthorizeResponse.Content.Headers.ContentType?.MediaType.Should().Be("text/plain");
        (await AuthorizeResponse.Content.ReadAsStringAsync()).Should().Be(reason);
    }

    public async Task Then_client_receives_access_and_refresh_tokens()
    {
        var response = CodeExchangeResponses.Single();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Headers.CacheControl?.NoStore.Should().BeTrue();

        using var tokens = await ReadJson(response);
        tokens.RootElement.GetProperty("access_token").GetString().Should().NotBeNullOrWhiteSpace();
        tokens.RootElement.GetProperty("refresh_token").GetString().Should().NotBeNullOrWhiteSpace();
        tokens.RootElement.GetProperty("token_type").GetString().Should().Be("Bearer");
        tokens.RootElement.GetProperty("expires_in").GetInt32().Should().Be(3600);
    }

    public Task Then_products_contain(Product product)
    {
        ToolResult.IsError.Should().NotBe(true);

        using var products = JsonDocument.Parse(ToolResultText());
        products.RootElement.GetProperty("totalCount").GetInt32().Should().Be(1);

        var listedProduct = products.RootElement.GetProperty("products").EnumerateArray().Single();
        listedProduct.GetProperty("name").GetString().Should().Be(product.Name);
        listedProduct.GetProperty("category").GetProperty("name").GetString().Should().Be(product.Category!.Name);

        return Task.CompletedTask;
    }

    protected async Task<McpClient> ConnectMcpClient()
    {
        var transport = new HttpClientTransport(
            new HttpClientTransportOptions
            {
                Endpoint = new Uri(McpResource),
                TransportMode = HttpTransportMode.StreamableHttp,
                AdditionalHeaders = new Dictionary<string, string>
                {
                    ["Authorization"] = $"Bearer {AccessToken}"
                }
            },
            _hostWithoutOwnerSignIn.CreateClient());

        return await McpClient.CreateAsync(transport);
    }

    protected string ToolResultText() => ToolResult.Content.OfType<TextContentBlock>().Single().Text;

    protected AccessGrant AccessGrantFor(string email) => new(Client.ClientId!, email, "food:read", McpResource);

    protected static async Task<JsonDocument> ReadJson(HttpResponseMessage response) =>
        JsonDocument.Parse(await response.Content.ReadAsStringAsync());

    protected string AuthorizationResponseParameter(string name)
    {
        AuthorizeResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);

        var location = AuthorizeResponse.Headers.Location!;
        location.GetLeftPart(UriPartial.Path).Should().Be(Client.RedirectUri);

        return QueryHelpers.ParseQuery(location.Query).GetValueOrDefault(name).ToString();
    }

    protected async Task<string> CimdAuthorizationCode() =>
        (await LastConsentDecisionRedirectParameters())["code"].ToString();

    protected async Task<Dictionary<string, StringValues>> LastConsentDecisionRedirectParameters()
    {
        var response = ConsentDecisionResponses[^1];
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        using var decision = await ReadJson(response);
        var redirectUrl = new Uri(decision.RootElement.GetProperty("redirectUrl").GetString()!);
        redirectUrl.GetLeftPart(UriPartial.Path).Should().Be(CimdRedirectUri);

        return QueryHelpers.ParseQuery(redirectUrl.Query);
    }

    protected string ConsentRequestFromRedirect()
    {
        const string consentRoutePrefix = "/#/mcp-consent?consentRequest=";

        AuthorizeResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);

        var location = AuthorizeResponse.Headers.Location!.OriginalString;
        location.Should().StartWith(consentRoutePrefix);

        return Uri.UnescapeDataString(location[consentRoutePrefix.Length..]);
    }

    protected static Dictionary<string, object?> CimdDocument() => new()
    {
        ["client_id"] = CimdClientId,
        ["client_name"] = CimdClientName,
        ["logo_uri"] = CimdLogoUri,
        ["redirect_uris"] = new[] { CimdRedirectUri },
        ["token_endpoint_auth_method"] = "none"
    };

    protected async Task ServeCimdDocument(Dictionary<string, object?> document)
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupDocument(CimdDocumentPath, document);
    }

    protected async Task StartMetadataHostReachableOverLoopback()
    {
        await MetadataHost.Start();

        Factory = Factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
        {
            services.AddSingleton<ICimdAddressFilter, LoopbackAllowedAddressFilter>();
            TrustMetadataHostCertificate(services);
        }));
    }

    protected static void TrustMetadataHostCertificate(IServiceCollection services)
    {
        services.AddHttpClient(CimdMetadataDocumentFetcher.HttpClientName)
            .ConfigurePrimaryHttpMessageHandler((handler, _) =>
                ((SocketsHttpHandler)handler).SslOptions.RemoteCertificateValidationCallback = (_, _, _, _) => true);
    }

    // The CIMD draft (§8.6) allows fetching from loopback only when testing
    protected sealed class LoopbackAllowedAddressFilter : ICimdAddressFilter
    {
        private readonly SpecialUseAddressFilter _specialUseAddressFilter = new();

        public bool IsAllowed(IPAddress address) =>
            IPAddress.IsLoopback(address) || _specialUseAddressFilter.IsAllowed(address);
    }
}
