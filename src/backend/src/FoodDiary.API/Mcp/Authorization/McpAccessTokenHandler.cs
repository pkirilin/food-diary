using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace FoodDiary.API.Mcp.Authorization;

internal sealed class McpAccessTokenHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> schemeOptions,
    ILoggerFactory logger,
    UrlEncoder encoder,
    McpTokenService tokenService,
    IOptions<McpOptions> mcpOptions) : AuthenticationHandler<AuthenticationSchemeOptions>(schemeOptions, logger, encoder)
{
    public const string SchemeName = "Bearer";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!AuthenticationHeaderValue.TryParse(Request.Headers.Authorization, out var authorization) ||
            !authorization.Scheme.Equals(SchemeName, StringComparison.OrdinalIgnoreCase) ||
            authorization.Parameter is null)
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var grant = tokenService.ValidateAccessToken(authorization.Parameter);

        if (grant is null)
        {
            return Task.FromResult(AuthenticateResult.Fail("Access token is invalid, expired or issued for another resource"));
        }

        var identity = new ClaimsIdentity([new Claim(Constants.ClaimTypes.Email, grant.Email)], Scheme.Name);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        Response.Headers.Append(
            HeaderNames.WWWAuthenticate,
            $"Bearer resource_metadata=\"{mcpOptions.Value.ResourceMetadataUrl}\", scope=\"{McpScopes.FoodRead}\"");

        return Task.CompletedTask;
    }
}
