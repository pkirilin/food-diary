using FoodDiary.API.Mcp;
using FoodDiary.API.Mcp.Authorization;
using Microsoft.Extensions.Options;

namespace FoodDiary.UnitTests.Mcp;

public class AuthorizeRequestValidatorTests
{
    private const string ClaudeCallback = "https://claude.ai/api/mcp/auth_callback";
    private const string InspectorCallback = "http://localhost:6274/oauth/callback";

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
}
