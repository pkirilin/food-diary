using FoodDiary.API.Mcp;
using FoodDiary.API.Mcp.Authorization;
using Microsoft.Extensions.Options;

namespace FoodDiary.UnitTests.Mcp;

public class AuthorizeRequestValidatorTests
{
    private const string ClaudeCallback = "https://claude.ai/api/mcp/auth_callback";
    private const string InspectorCallback = "http://localhost:6274/oauth/callback";
    private const string ConfiguredUrlClientId = "https://configured.example.com/oauth-client";

    private static readonly AuthorizeRequestValidator Validator = new(Options.Create(new McpOptions
    {
        Enabled = true,
        BaseUrl = "https://diary.example.com",
        Clients =
        [
            new McpClientRegistration { ClientId = "claude", ClientSecret = "secret", RedirectUri = ClaudeCallback },
            new McpClientRegistration
            {
                ClientId = "inspector", ClientSecret = "another-secret", RedirectUri = InspectorCallback
            },
            new McpClientRegistration
            {
                ClientId = ConfiguredUrlClientId, ClientSecret = "url-secret", RedirectUri = ClaudeCallback
            }
        ]
    }));

    private static AuthorizeRequest Request(string? clientId, string? redirectUri) => new(
        ResponseType: "code",
        ClientId: clientId,
        RedirectUri: redirectUri,
        CodeChallenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
        CodeChallengeMethod: "S256",
        Scope: "food:read",
        Resource: "https://diary.example.com/mcp",
        State: "af0ifjsldkj");

    [Fact]
    public void SecondRegisteredClient_WithItsOwnRedirectUri_IsAccepted()
    {
        var result = Validator.Validate(Request("inspector", InspectorCallback));

        result.Should().BeOfType<AuthorizeRequestValidation.Accepted>();
    }

    [Theory]
    [InlineData("unknown")]
    [InlineData("CLAUDE")]
    [InlineData("")]
    [InlineData(null)]
    public void UnknownClientId_IsRefused(string? clientId)
    {
        var result = Validator.Validate(Request(clientId, ClaudeCallback));

        result.Should().BeOfType<AuthorizeRequestValidation.Refused>();
    }

    [Theory]
    [InlineData("https://attacker.example/api/mcp/auth_callback")]
    [InlineData("https://claude.ai/api/mcp/auth_callback/")]
    [InlineData("https://claude.ai/api/mcp/AUTH_CALLBACK")]
    [InlineData("https://claude.ai/api/mcp/auth_callback?next=https://attacker.example")]
    [InlineData(InspectorCallback)]
    [InlineData("")]
    [InlineData(null)]
    public void RedirectUriNotRegisteredForClient_IsRefused(string? redirectUri)
    {
        var result = Validator.Validate(Request("claude", redirectUri));

        result.Should().BeOfType<AuthorizeRequestValidation.Refused>();
    }

    [Theory]
    [InlineData("https://chatboxai.app/.well-known/oauth-client")]
    [InlineData("https://client.example.com/")]
    [InlineData("https://client.example.com:8443/oauth-client.json")]
    [InlineData("https://client.example.com/oauth-client?version=2")]
    [InlineData("https://client.example.com/a.b/..c/oauth-client")]
    public void UnregisteredClientId_ThatIsMetadataDocumentUrl_IsCimdClient(string clientId)
    {
        var result = Validator.Validate(Request(clientId, "http://127.0.0.1:1456/callback"));

        result.Should().BeOfType<AuthorizeRequestValidation.CimdClient>();
    }

    [Theory]
    [InlineData("http://client.example.com/oauth-client")]
    [InlineData("ftp://client.example.com/oauth-client")]
    [InlineData("https://client.example.com")]
    [InlineData("https://client.example.com?version=2")]
    [InlineData("https://user:password@client.example.com/oauth-client")]
    [InlineData("https://@client.example.com/oauth-client")]
    [InlineData("https://client.example.com/a/../oauth-client")]
    [InlineData("https://client.example.com/./oauth-client")]
    [InlineData("https://client.example.com/oauth-client/..")]
    [InlineData("https://client.example.com/a/%2e%2e/oauth-client")]
    [InlineData("https://client.example.com/a/.%2E/oauth-client")]
    [InlineData(@"https://client.example.com/a\..\oauth-client")]
    [InlineData("https://client.example.com/oauth-client#section")]
    [InlineData("https://client.example.com/oauth-client#")]
    [InlineData("https:client.example.com/oauth-client")]
    public void UnregisteredClientId_ThatIsNotMetadataDocumentUrl_IsRefused(string clientId)
    {
        var result = Validator.Validate(Request(clientId, "http://127.0.0.1:1456/callback"));

        result.Should().BeOfType<AuthorizeRequestValidation.Refused>();
    }

    [Fact]
    public void RegisteredClientId_ThatIsMetadataDocumentUrl_IsValidatedAsRegisteredClient()
    {
        var result = Validator.Validate(Request(ConfiguredUrlClientId, ClaudeCallback));

        result.Should().BeOfType<AuthorizeRequestValidation.Accepted>();
    }
}
