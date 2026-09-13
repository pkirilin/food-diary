using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp.Authorization;

internal sealed class TokenRequestHandler(McpTokenService tokenService, IOptions<McpOptions> options)
{
    private sealed record TokenResponse(
        string AccessToken,
        string TokenType,
        int ExpiresIn,
        string? RefreshToken,
        string Scope);

    private sealed record ErrorResponse(string Error, string ErrorDescription);

    public async Task<IResult> Handle(HttpContext context)
    {
        context.Response.Headers.CacheControl = "no-store";
        context.Response.Headers.Pragma = "no-cache";

        if (!context.Request.HasFormContentType)
        {
            return Error("invalid_request", "Expected application/x-www-form-urlencoded");
        }

        var form = await context.Request.ReadFormAsync(context.RequestAborted);
        var client = options.Value.FindClient(SingleValue(form, "client_id"));

        if (client is null || !SecretMatches(SingleValue(form, "client_secret"), client.ClientSecret!))
        {
            return Error("invalid_client", "Client authentication failed", StatusCodes.Status401Unauthorized);
        }

        return SingleValue(form, "grant_type") switch
        {
            "authorization_code" => ExchangeAuthorizationCode(form, client),
            "refresh_token" => RefreshAccessToken(form, client),
            _ => Error("unsupported_grant_type", "grant_type must be authorization_code or refresh_token")
        };
    }

    private IResult ExchangeAuthorizationCode(IFormCollection form, McpClientRegistration client)
    {
        var grant = tokenService.RedeemAuthorizationCode(SingleValue(form, "code") ?? string.Empty);

        if (grant is null || grant.Access.ClientId != client.ClientId)
        {
            return Error("invalid_grant", "Authorization code is invalid, expired or already used");
        }

        if (SingleValue(form, "redirect_uri") is { } redirectUri && redirectUri != grant.RedirectUri)
        {
            return Error("invalid_grant", "redirect_uri does not match the authorization request");
        }

        if (!CodeVerifierMatches(SingleValue(form, "code_verifier"), grant.CodeChallenge))
        {
            return Error("invalid_grant", "code_verifier does not match code_challenge");
        }

        if (SingleValue(form, "resource") is { } resource && resource != grant.Access.Resource)
        {
            return Error("invalid_target", "resource does not match the authorization request");
        }

        var tokens = tokenService.IssueTokens(grant.Access);

        return TokensIssued(tokens.AccessToken, tokens.RefreshToken, grant.Access.Scope);
    }

    private IResult RefreshAccessToken(IFormCollection form, McpClientRegistration client)
    {
        var access = tokenService.ValidateRefreshToken(SingleValue(form, "refresh_token") ?? string.Empty);

        if (access is null || access.ClientId != client.ClientId)
        {
            return Error("invalid_grant", "Refresh token is invalid or expired");
        }

        return TokensIssued(tokenService.IssueAccessToken(access), refreshToken: null, access.Scope);
    }

    private IResult TokensIssued(string accessToken, string? refreshToken, string scope)
    {
        var expiresIn = (int)options.Value.AccessTokenLifetime.TotalSeconds;
        var response = new TokenResponse(accessToken, "Bearer", expiresIn, refreshToken, scope);

        return Results.Json(response, AuthorizationServerEndpoints.SerializerOptions);
    }

    private static string? SingleValue(IFormCollection form, string key) =>
        form[key] is { Count: 1 } values ? values[0] : null;

    private static bool SecretMatches(string? presentedSecret, string registeredSecret) =>
        presentedSecret is not null && CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(presentedSecret),
            Encoding.UTF8.GetBytes(registeredSecret));

    private static bool CodeVerifierMatches(string? codeVerifier, string codeChallenge) =>
        codeVerifier is not null &&
        WebEncoders.Base64UrlEncode(SHA256.HashData(Encoding.ASCII.GetBytes(codeVerifier))) == codeChallenge;

    private static IResult Error(string error, string description, int statusCode = StatusCodes.Status400BadRequest) =>
        Results.Json(
            new ErrorResponse(error, description),
            AuthorizationServerEndpoints.SerializerOptions,
            statusCode: statusCode);
}
