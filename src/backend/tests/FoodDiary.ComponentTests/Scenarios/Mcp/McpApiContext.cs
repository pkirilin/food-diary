using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using FoodDiary.API;
using FoodDiary.API.Mcp;
using FoodDiary.API.Mcp.Authorization;
using FoodDiary.API.Mcp.Authorization.Cimd;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.DateAndTime;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using FoodDiary.Domain.Entities;
using JetBrains.Annotations;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using ModelContextProtocol.Client;
using ModelContextProtocol.Protocol;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

[UsedImplicitly]
public class McpApiContext : BaseContext
{
    // PKCE example values from RFC 7636, Appendix B
    private const string CodeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    private const string CodeChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

    private const string State = "af0ifjsldkj";

    private const string AllowedUserEmail = "fake.user@gmail.com";
    private const string AnotherAllowedUserEmail = "another.user@gmail.com";

    private const string CimdDocumentPath = "/oauth-client.json";
    private const string CimdClientName = "Test MCP Client";
    private const string CimdLogoUri = "https://client.example.com/logo.png";
    private const string CimdRedirectUri = "http://127.0.0.1:1456/callback";
    private static readonly string CimdClientId = McpClientMetadataHost.UrlOf(CimdDocumentPath);

    private readonly McpOptions _mcpOptions;
    private readonly ExternalServicesFixture _externalServices;

    // Each Factory.WithWebHostBuilder starts another host; these keep the hosts of one scenario a single server
    private readonly AdjustableDateTimeProvider _clock = new();
    private readonly MemoryCache _memoryCache = new(new MemoryCacheOptions());

    // Fake owner sign-in authenticates MCP requests too, whatever access token they carry
    private readonly WebApplicationFactory<Startup> _hostWithoutOwnerSignIn;

    private HttpClient? _oAuthClient;
    private HttpResponseMessage _metadataResponse = null!;
    private HttpResponseMessage _authorizeResponse = null!;
    private string? _authorizationCode;
    private string? _consentRequest;
    private readonly List<HttpResponseMessage> _consentPageResponses = [];
    private readonly List<HttpResponseMessage> _consentDecisionResponses = [];
    private readonly List<HttpResponseMessage> _codeExchangeResponses = [];
    private readonly List<HttpResponseMessage> _refreshResponses = [];
    private readonly List<string> _issuedRefreshTokens = [];
    private HttpResponseMessage _mcpResponse = null!;
    private HttpResponseMessage _resourceMetadataResponse = null!;
    private HttpResponseMessage _response = null!;
    private string? _accessToken;
    private Implementation _connectedServer = null!;
    private List<string> _listedToolNames = [];
    private CallToolResult _toolResult = null!;
    private List<string> _listedPromptNames = [];
    private GetPromptResult _promptResult = null!;

    private McpClientMetadataHost MetadataHost => _externalServices.McpClientMetadataHost;
    private McpClientRegistration Client => _mcpOptions.Clients[0];
    private string McpResource => _mcpOptions.McpResource;
    private McpTokenService TokenService => Factory.Services.GetRequiredService<McpTokenService>();

    private HttpClient OAuthClient => _oAuthClient ??= Factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        AllowAutoRedirect = false
    });

    public McpApiContext(FoodDiaryWebApplicationFactory factory, ExternalServicesFixture externalServices) : base(factory)
    {
        _mcpOptions = factory.Services.GetRequiredService<IOptions<McpOptions>>().Value;
        _externalServices = externalServices;

        Factory = factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
        {
            services.AddSingleton<TimeProvider>(_clock);
            services.AddSingleton<IMemoryCache>(_memoryCache);
        }));

        _hostWithoutOwnerSignIn = Factory;
    }

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

    public Task Given_refresh_token_was_issued_before_rotation()
    {
        var preRotationPayload = JsonSerializer.Serialize(new
        {
            Grant = AccessGrantFor(AllowedUserEmail),
            ExpiresAt = _clock.GetUtcNow() + _mcpOptions.RefreshTokenLifetime
        });

        _issuedRefreshTokens.Add(Factory.Services.GetRequiredService<IDataProtectionProvider>()
            .CreateProtector("FoodDiary.Mcp.RefreshToken")
            .Protect(preRotationPayload));

        return Task.CompletedTask;
    }

    public Task Given_no_configured_mcp_clients()
    {
        Factory = Factory.WithWebHostBuilder(builder => builder.ConfigureAppConfiguration((_, configuration) =>
        {
            const string componentTestsSettingsFile = "appsettings.ComponentTests.json";

            var componentTestsSettingsSources = configuration.Sources
                .OfType<JsonConfigurationSource>()
                .Where(source => source.Path == componentTestsSettingsFile)
                .ToList();

            var settingsWithoutClients = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile(componentTestsSettingsFile)
                .Build()
                .AsEnumerable()
                .Where(setting => !setting.Key.StartsWith("Mcp:Clients", StringComparison.Ordinal));

            componentTestsSettingsSources.ForEach(source => configuration.Sources.Remove(source));
            configuration.AddInMemoryCollection(settingsWithoutClients);
        }));

        return Task.CompletedTask;
    }

    public Task Given_mcp_is_disabled()
    {
        Factory = Factory.WithWebHostBuilder(builder => builder.ConfigureAppConfiguration((_, configuration) =>
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Mcp:Enabled"] = "false"
            })));

        return Task.CompletedTask;
    }

    public async Task Given_cimd_client_metadata_document()
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupDocument(CimdDocumentPath, CimdDocument());
    }

    public async Task Given_cimd_client_metadata_document_is_not_found()
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupStatus(CimdDocumentPath, HttpStatusCode.NotFound);
    }

    public async Task Given_cimd_client_metadata_document_redirects_to_another_url()
    {
        const string redirectTargetPath = "/moved-oauth-client.json";

        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupStatus(CimdDocumentPath, HttpStatusCode.Found, new Dictionary<string, object>
        {
            ["Location"] = McpClientMetadataHost.UrlOf(redirectTargetPath)
        });
        await MetadataHost.SetupDocument(redirectTargetPath, CimdDocument());
    }

    public async Task Given_cimd_client_metadata_document_responds_after(int seconds)
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupDocument(CimdDocumentPath, CimdDocument(), latencyInMilliseconds: seconds * 1000);
    }

    public async Task Given_cimd_client_metadata_document_larger_than_5_kb()
    {
        var document = CimdDocument();
        document["client_name"] = new string('a', 5 * 1024);

        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupDocument(CimdDocumentPath, document);
    }

    public async Task Given_cimd_client_metadata_document_is_not_json()
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupBody(CimdDocumentPath, "client_name=Test MCP Client");
    }

    public async Task Given_cimd_client_metadata_document_served_as(string contentType)
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupDocument(CimdDocumentPath, CimdDocument(), contentType: contentType);
    }

    public async Task Given_cimd_client_metadata_document_served_with_untrusted_certificate()
    {
        await MetadataHost.Start();
        Factory = Factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
            services.AddSingleton<ICimdAddressFilter, LoopbackAllowedAddressFilter>()));
        await MetadataHost.SetupDocument(CimdDocumentPath, CimdDocument());
    }

    public Task Given_cimd_client_metadata_document_without(string field)
    {
        var document = CimdDocument();
        document.Remove(field);

        return ServeCimdDocument(document);
    }

    public Task Given_cimd_client_metadata_document_with(string field, object value)
    {
        var document = CimdDocument();
        document[field] = value;

        return ServeCimdDocument(document);
    }

    public Task Given_cimd_client_metadata_document_with_redirect_uri(string redirectUri)
    {
        return Given_cimd_client_metadata_document_with("redirect_uris", new[] { redirectUri });
    }

    public Task Given_cimd_client_metadata_document_with_logo_and_redirect_uris(string logoUri, params string[] redirectUris)
    {
        var document = CimdDocument();
        document["logo_uri"] = logoUri;
        document["redirect_uris"] = redirectUris;

        return ServeCimdDocument(document);
    }

    public async Task Given_cimd_client_metadata_document_behind_real_address_filter()
    {
        await MetadataHost.Start();
        Factory = Factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(TrustMetadataHostCertificate));
        await MetadataHost.SetupDocument(CimdDocumentPath, CimdDocument());
    }

    public Task Given_notes(params Note[] notes)
    {
        return Factory.SeedDataAsync(notes);
    }

    public Task Given_products(params Product[] products)
    {
        return Factory.SeedDataAsync(products);
    }

    public Task When_days_pass(int days)
    {
        _clock.Advance(TimeSpan.FromDays(days));
        return Task.CompletedTask;
    }

    public async Task When_mcp_client_connects()
    {
        await using var mcpClient = await ConnectMcpClient();
        _connectedServer = mcpClient.ServerInfo;
    }

    public Task When_mcp_client_calls_get_food_logs(string from, string to)
    {
        return When_mcp_client_calls_listed_tool("get_food_logs", new Dictionary<string, object?>
        {
            ["from"] = from,
            ["to"] = to
        });
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

    private async Task When_mcp_client_calls_listed_tool(string toolName, Dictionary<string, object?> arguments)
    {
        await using var mcpClient = await ConnectMcpClient();

        var tools = await mcpClient.ListToolsAsync();
        _listedToolNames = tools.Select(tool => tool.Name).ToList();

        _toolResult = await tools.Single(tool => tool.Name == toolName).CallAsync(arguments);
    }

    public async Task When_mcp_client_gets_nutrition_report_prompt(string period)
    {
        await using var mcpClient = await ConnectMcpClient();

        var prompts = await mcpClient.ListPromptsAsync();
        _listedPromptNames = prompts.Select(prompt => prompt.Name).ToList();

        _promptResult = await prompts.Single(prompt => prompt.Name == "nutrition_report")
            .GetAsync(new Dictionary<string, object?> { ["period"] = period });
    }

    public async Task When_client_requests_authorization_server_metadata()
    {
        _metadataResponse = await OAuthClient.GetAsync("/.well-known/oauth-authorization-server");
    }

    public async Task When_client_requests(string method, string path)
    {
        _response = await OAuthClient.SendAsync(new HttpRequestMessage(new HttpMethod(method), path));
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
        _authorizeResponse = await OAuthClient.GetAsync(QueryHelpers.AddQueryString("/authorize", parameters));
    }

    public async Task When_owner_opens_consent_page()
    {
        _consentRequest ??= ConsentRequestFromRedirect();

        _consentPageResponses.Add(await OAuthClient.GetAsync(
            $"/authorize/consent?consentRequest={Uri.EscapeDataString(_consentRequest)}"));
    }

    public Task When_owner_approves_consent()
    {
        return DecideOnConsent(approved: true);
    }

    public Task When_owner_denies_consent()
    {
        return DecideOnConsent(approved: false);
    }

    private Task DecideOnConsent(bool approved)
    {
        _consentRequest ??= ConsentRequestFromRedirect();

        return RecordConsentDecision(OAuthClient.PostAsJsonAsync("/authorize/consent", new
        {
            consentRequest = _consentRequest,
            approved
        }));
    }

    public Task When_owner_approves_consent_with_null_consent_request()
    {
        return RecordConsentDecision(OAuthClient.PostAsJsonAsync("/authorize/consent", new
        {
            consentRequest = (string?)null,
            approved = true
        }));
    }

    private async Task RecordConsentDecision(Task<HttpResponseMessage> decision)
    {
        _consentDecisionResponses.Add(await decision);
    }

    public Task When_owner_approves_consent_with_form_post()
    {
        _consentRequest ??= ConsentRequestFromRedirect();

        return RecordConsentDecision(OAuthClient.PostAsync("/authorize/consent", new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["consentRequest"] = _consentRequest,
                ["approved"] = "true"
            })));
    }

    public Task When_consent_request_is_tampered_with()
    {
        var consentRequest = ConsentRequestFromRedirect();
        var middle = consentRequest.Length / 2;
        var replacement = consentRequest[middle] == 'A' ? 'B' : 'A';

        _consentRequest = string.Concat(consentRequest[..middle], replacement, consentRequest[(middle + 1)..]);

        return Task.CompletedTask;
    }

    public Task When_another_allowed_user_is_signed_in()
    {
        return SignInOnNewHost(AnotherAllowedUserEmail);
    }

    public Task When_owner_signs_in_again()
    {
        return SignInOnNewHost(AllowedUserEmail);
    }

    private Task SignInOnNewHost(string email)
    {
        Factory = _hostWithoutOwnerSignIn;
        _oAuthClient = null;

        return Given_authenticated_user(email);
    }

    public Task When_consent_api_is_called_with(string method)
    {
        _consentRequest = "unknown-consent-request";

        return method == "GET" ? When_owner_opens_consent_page() : When_owner_approves_consent();
    }

    public Task When_minutes_pass(int minutes)
    {
        _clock.Advance(TimeSpan.FromMinutes(minutes));
        return Task.CompletedTask;
    }

    public async Task When_cimd_client_exchanges_authorization_code()
    {
        await ExchangeAuthorizationCode(await CimdAuthorizationCode(), CimdRedirectUri, CimdClientId, clientSecret: null);
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

    private async Task ExchangeAuthorizationCode(
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

        _codeExchangeResponses.Add(await RecordIssuedTokens(response));
    }

    public Task When_client_refreshes_access_token()
    {
        return RefreshAccessToken(_issuedRefreshTokens[^1]);
    }

    public Task When_client_refreshes_access_token_with_first_refresh_token()
    {
        return RefreshAccessToken(_issuedRefreshTokens[0]);
    }

    public async Task When_client_refreshes_access_token_twice_at_once()
    {
        var refreshToken = _issuedRefreshTokens[^1];
        var responses = await Task.WhenAll(SendRefreshRequest(refreshToken), SendRefreshRequest(refreshToken));

        foreach (var response in responses)
        {
            _refreshResponses.Add(await RecordIssuedTokens(response));
        }
    }

    public async Task When_cimd_client_refreshes_access_token()
    {
        var response = await SendRefreshRequest(_issuedRefreshTokens[^1], CimdClientId, clientSecret: null);
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

    private Task<HttpResponseMessage> RequestTokens(Dictionary<string, string?> parameters)
    {
        var sentParameters = parameters
            .Where(parameter => parameter.Value is not null)
            .ToDictionary(parameter => parameter.Key, parameter => parameter.Value!);

        return OAuthClient.PostAsync("/token", new FormUrlEncodedContent(sentParameters));
    }

    private async Task<HttpResponseMessage> RecordIssuedTokens(HttpResponseMessage tokenResponse)
    {
        if (tokenResponse.IsSuccessStatusCode)
        {
            using var tokens = await ReadJson(tokenResponse);
            _accessToken = tokens.RootElement.GetProperty("access_token").GetString();

            if (tokens.RootElement.TryGetProperty("refresh_token", out var refreshToken))
            {
                _issuedRefreshTokens.Add(refreshToken.GetString()!);
            }
        }

        return tokenResponse;
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

    public async Task Then_consent_sends_cimd_client_back_with_code()
    {
        var redirectParameters = await LastConsentDecisionRedirectParameters();

        redirectParameters.Keys.Should().BeEquivalentTo("code", "state", "iss");
        redirectParameters["code"].ToString().Should().NotBeEmpty();
        redirectParameters["state"].ToString().Should().Be(State);
        redirectParameters["iss"].ToString().Should().Be(_mcpOptions.BaseUrl);
    }

    public async Task Then_consent_sends_cimd_client_back_with_error(string error)
    {
        var redirectParameters = await LastConsentDecisionRedirectParameters();

        redirectParameters.Keys.Should().BeEquivalentTo("error", "state", "iss");
        redirectParameters["error"].ToString().Should().Be(error);
        redirectParameters["state"].ToString().Should().Be(State);
        redirectParameters["iss"].ToString().Should().Be(_mcpOptions.BaseUrl);
    }

    public async Task Then_consent_request_is_refused_as_expired()
    {
        foreach (var response in _consentPageResponses.Concat(_consentDecisionResponses))
        {
            await ShouldBeExpiredConsentRequest(response);
        }
    }

    public async Task Then_consent_request_is_refused_as_expired_after_first_decision()
    {
        _consentDecisionResponses[0].StatusCode.Should().Be(HttpStatusCode.OK);

        foreach (var response in _consentPageResponses.Concat(_consentDecisionResponses.Skip(1)))
        {
            await ShouldBeExpiredConsentRequest(response);
        }
    }

    private static async Task ShouldBeExpiredConsentRequest(HttpResponseMessage response)
    {
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");

        using var problem = await ReadJson(response);
        problem.RootElement.GetProperty("title").GetString().Should().Be("Consent request expired");
        problem.RootElement.GetProperty("detail").GetString()
            .Should().Be("This request has expired; start again from your MCP Client.");
    }

    public Task Then_consent_api_asks_owner_to_sign_in_with_google()
    {
        var response = _consentPageResponses.Concat(_consentDecisionResponses).Single();
        response.StatusCode.Should().Be(HttpStatusCode.Redirect);
        response.Headers.Location!.Host.Should().Be("accounts.google.com");
        return Task.CompletedTask;
    }

    public Task Then_consent_api_is_forbidden()
    {
        _consentPageResponses.Concat(_consentDecisionResponses).Single()
            .StatusCode.Should().Be(HttpStatusCode.Forbidden);
        return Task.CompletedTask;
    }

    public Task Then_consent_decision_is_refused_as_unsupported_media_type()
    {
        _consentDecisionResponses.Single().StatusCode.Should().Be(HttpStatusCode.UnsupportedMediaType);
        return Task.CompletedTask;
    }

    public async Task Then_consent_page_shows_client(string? logoUri, string redirectUriHost, bool isLocalhostOnly)
    {
        var response = _consentPageResponses.Single();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/json");

        var consent = JsonNode.Parse(await response.Content.ReadAsStringAsync());
        var expectedConsent = new JsonObject
        {
            ["clientName"] = CimdClientName,
            ["logoUri"] = logoUri,
            ["clientIdHost"] = "localhost",
            ["redirectUriHost"] = redirectUriHost,
            ["isLocalhostOnly"] = isLocalhostOnly
        };

        JsonNode.DeepEquals(consent, expectedConsent)
            .Should().BeTrue("consent must be {0}, but was {1}", expectedConsent.ToJsonString(), consent?.ToJsonString());
    }

    public async Task Then_authorization_is_refused_with(string reason)
    {
        _authorizeResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        _authorizeResponse.Content.Headers.ContentType?.MediaType.Should().Be("text/plain");
        (await _authorizeResponse.Content.ReadAsStringAsync()).Should().Be(reason);
    }

    public Task Then_owner_is_asked_to_sign_in_with_google()
    {
        _authorizeResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);
        _authorizeResponse.Headers.Location!.Host.Should().Be("accounts.google.com");
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
              "token_endpoint_auth_methods_supported": ["client_secret_post", "none"],
              "scopes_supported": ["food:read"],
              "authorization_response_iss_parameter_supported": true,
              "client_id_metadata_document_supported": true
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

    public Task Then_response_is_not_found()
    {
        _response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        return Task.CompletedTask;
    }

    public Task Then_response_cannot_be_embedded_in_another_site()
    {
        _response.Headers
            .Where(header => header.Key == "Content-Security-Policy")
            .SelectMany(header => header.Value)
            .Should().Equal("frame-ancestors 'none'");

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

    public async Task Then_client_receives_new_access_and_refresh_tokens()
    {
        var response = _refreshResponses.Single();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Headers.CacheControl?.NoStore.Should().BeTrue();

        using var tokens = await ReadJson(response);
        tokens.RootElement.GetProperty("access_token").GetString().Should().NotBeNullOrWhiteSpace();
        tokens.RootElement.GetProperty("token_type").GetString().Should().Be("Bearer");
        tokens.RootElement.GetProperty("expires_in").GetInt32().Should().Be(3600);
        _issuedRefreshTokens.Should().HaveCount(2).And.OnlyHaveUniqueItems();
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
        var response = _codeExchangeResponses.Single();
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        using var error = await ReadJson(response);
        error.RootElement.GetProperty("error").GetString().Should().Be("invalid_client");
        error.RootElement.GetProperty("error_description").GetString().Should().Be(description);
    }

    public Task Then_code_exchange_is_refused()
    {
        return ShouldBeInvalidGrant(_codeExchangeResponses.Single());
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
        _issuedRefreshTokens.Should().HaveCount(_refreshResponses.Count + 1).And.OnlyHaveUniqueItems();
        return Task.CompletedTask;
    }

    public async Task Then_only_the_first_code_exchange_succeeds()
    {
        _codeExchangeResponses.Select(response => response.StatusCode)
            .Should().Equal(HttpStatusCode.OK, HttpStatusCode.BadRequest);

        using var error = await ReadJson(_codeExchangeResponses[1]);
        error.RootElement.GetProperty("error").GetString().Should().Be("invalid_grant");
    }

    public Task Then_mcp_client_lists_tools(params string[] toolNames)
    {
        _listedToolNames.Should().BeEquivalentTo(toolNames);
        return Task.CompletedTask;
    }

    public Task Then_mcp_client_lists_prompts(params string[] promptNames)
    {
        _listedPromptNames.Should().BeEquivalentTo(promptNames);
        return Task.CompletedTask;
    }

    public Task Then_prompt_mentions(string text)
    {
        _promptResult.Messages.Select(message => message.Content).OfType<TextContentBlock>().Single().Text
            .Should().Contain(text);
        return Task.CompletedTask;
    }

    public Task Then_food_logs_contain(Note note)
    {
        _toolResult.IsError.Should().NotBe(true);

        using var foodLogs = JsonDocument.Parse(ToolResultText());
        var day = foodLogs.RootElement.GetProperty("days").EnumerateArray().Single();
        day.GetProperty("date").GetString().Should().Be(note.Date.ToString("yyyy-MM-dd"));

        var item = day.GetProperty("meals").EnumerateArray().Single().GetProperty("items").EnumerateArray().Single();
        item.GetProperty("product").GetProperty("name").GetString().Should().Be(note.Product!.Name);
        item.GetProperty("quantity").GetInt32().Should().Be(note.ProductQuantity);

        return Task.CompletedTask;
    }

    public Task Then_products_contain(Product product)
    {
        _toolResult.IsError.Should().NotBe(true);

        using var products = JsonDocument.Parse(ToolResultText());
        products.RootElement.GetProperty("totalCount").GetInt32().Should().Be(1);

        var listedProduct = products.RootElement.GetProperty("products").EnumerateArray().Single();
        listedProduct.GetProperty("name").GetString().Should().Be(product.Name);
        listedProduct.GetProperty("category").GetProperty("name").GetString().Should().Be(product.Category!.Name);

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
            _hostWithoutOwnerSignIn.CreateClient());

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

    private async Task<string> CimdAuthorizationCode() =>
        (await LastConsentDecisionRedirectParameters())["code"].ToString();

    private async Task<Dictionary<string, StringValues>> LastConsentDecisionRedirectParameters()
    {
        var response = _consentDecisionResponses[^1];
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        using var decision = await ReadJson(response);
        var redirectUrl = new Uri(decision.RootElement.GetProperty("redirectUrl").GetString()!);
        redirectUrl.GetLeftPart(UriPartial.Path).Should().Be(CimdRedirectUri);

        return QueryHelpers.ParseQuery(redirectUrl.Query);
    }

    private string ConsentRequestFromRedirect()
    {
        const string consentRoutePrefix = "/#/mcp-consent?consentRequest=";

        _authorizeResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);

        var location = _authorizeResponse.Headers.Location!.OriginalString;
        location.Should().StartWith(consentRoutePrefix);

        return Uri.UnescapeDataString(location[consentRoutePrefix.Length..]);
    }

    private static Dictionary<string, object?> CimdDocument() => new()
    {
        ["client_id"] = CimdClientId,
        ["client_name"] = CimdClientName,
        ["logo_uri"] = CimdLogoUri,
        ["redirect_uris"] = new[] { CimdRedirectUri },
        ["token_endpoint_auth_method"] = "none"
    };

    private async Task ServeCimdDocument(Dictionary<string, object?> document)
    {
        await StartMetadataHostReachableOverLoopback();
        await MetadataHost.SetupDocument(CimdDocumentPath, document);
    }

    private async Task StartMetadataHostReachableOverLoopback()
    {
        await MetadataHost.Start();

        Factory = Factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
        {
            services.AddSingleton<ICimdAddressFilter, LoopbackAllowedAddressFilter>();
            TrustMetadataHostCertificate(services);
        }));
    }

    private static void TrustMetadataHostCertificate(IServiceCollection services)
    {
        services.AddHttpClient(CimdMetadataDocumentFetcher.HttpClientName)
            .ConfigurePrimaryHttpMessageHandler((handler, _) =>
                ((SocketsHttpHandler)handler).SslOptions.RemoteCertificateValidationCallback = (_, _, _, _) => true);
    }

    // The CIMD draft (§8.6) allows fetching from loopback only when testing
    private sealed class LoopbackAllowedAddressFilter : ICimdAddressFilter
    {
        private readonly SpecialUseAddressFilter _specialUseAddressFilter = new();

        public bool IsAllowed(IPAddress address) =>
            IPAddress.IsLoopback(address) || _specialUseAddressFilter.IsAllowed(address);
    }
}
