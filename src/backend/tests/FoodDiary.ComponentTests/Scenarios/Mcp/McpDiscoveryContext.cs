using System.Net;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using JetBrains.Annotations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

[UsedImplicitly]
public class McpDiscoveryContext(FoodDiaryWebApplicationFactory factory, ExternalServicesFixture externalServices)
    : McpContext(factory, externalServices)
{
    private HttpResponseMessage _metadataResponse = null!;
    private HttpResponseMessage _resourceMetadataResponse = null!;

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

    public async Task When_client_requests_authorization_server_metadata()
    {
        _metadataResponse = await OAuthClient.GetAsync("/.well-known/oauth-authorization-server");
    }

    public async Task When_client_requests(string method, string path)
    {
        Response = await OAuthClient.SendAsync(new HttpRequestMessage(new HttpMethod(method), path));
    }

    public Task When_client_calls_mcp_without_access_token()
    {
        return CallMcp(accessToken: null);
    }

    public async Task When_client_requests_resource_metadata_from_challenge()
    {
        var challengeParameters = McpResponse.Headers.WwwAuthenticate.FirstOrDefault()?.Parameter ?? string.Empty;
        var resourceMetadataUrl = Regex.Match(challengeParameters, "resource_metadata=\"([^\"]+)\"").Groups[1].Value;

        _resourceMetadataResponse = await OAuthClient.GetAsync(resourceMetadataUrl);
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
        McpResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        McpResponse.Headers.WwwAuthenticate.Select(challenge => challenge.ToString()).Should().Equal(
            """
            Bearer resource_metadata="http://localhost/.well-known/oauth-protected-resource/mcp", scope="food:read"
            """);

        return Task.CompletedTask;
    }

    public Task Then_response_is_not_found()
    {
        Response!.StatusCode.Should().Be(HttpStatusCode.NotFound);
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
}
