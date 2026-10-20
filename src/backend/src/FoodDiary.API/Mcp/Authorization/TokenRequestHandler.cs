using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using FoodDiary.Application.Mcp.IssueRefreshToken;
using FoodDiary.Application.Mcp.RotateRefreshToken;
using JetBrains.Annotations;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp.Authorization;

internal sealed class TokenRequestHandler(
    McpTokenService tokenService,
    IssueRefreshTokenCommandHandler issueRefreshTokenHandler,
    RotateRefreshTokenCommandHandler rotateRefreshTokenHandler,
    IOptions<McpOptions> options)
{
    [PublicAPI]
    private sealed record TokenResponse(
        string AccessToken,
        string TokenType,
        int ExpiresIn,
        string RefreshToken,
        string Scope);

    [PublicAPI]
    // ReSharper disable once MemberHidesStaticFromOuterClass
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
        var clientId = SingleValue(form, "client_id") ?? string.Empty;

        if (ClientAuthenticationFailure(form, clientId) is { } failure)
        {
            return Error("invalid_client", failure, StatusCodes.Status401Unauthorized);
        }

        return SingleValue(form, "grant_type") switch
        {
            "authorization_code" => await ExchangeAuthorizationCode(form, clientId, context.RequestAborted),
            "refresh_token" => await RefreshAccessToken(form, clientId, context.RequestAborted),
            _ => Error("unsupported_grant_type", "grant_type must be authorization_code or refresh_token")
        };
    }

    private string? ClientAuthenticationFailure(IFormCollection form, string clientId)
    {
        const string authenticationFailed = "Client authentication failed";

        return McpClientKind.Of(clientId, options.Value) switch
        {
            McpClientKind.Registered { Registration: var client } =>
                SecretMatches(SingleValue(form, "client_secret"), client.ClientSecret!) ? null : authenticationFailed,

            McpClientKind.Cimd when form.ContainsKey("client_secret") =>
                "Clients identified by a client ID metadata document are public and must not send client_secret",

            McpClientKind.Cimd => null,

            McpClientKind.Unknown => authenticationFailed,

            _ => throw new UnreachableException()
        };
    }

    private async Task<IResult> ExchangeAuthorizationCode(
        IFormCollection form,
        string clientId,
        CancellationToken cancellationToken)
    {
        var grant = tokenService.RedeemAuthorizationCode(SingleValue(form, "code") ?? string.Empty);

        if (grant is null || grant.Access.ClientId != clientId)
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

        await issueRefreshTokenHandler.Handle(
            new IssueRefreshTokenCommand(tokens.RefreshToken.Id, tokens.RefreshToken.FamilyId, tokens.RefreshToken.ExpiresAt),
            cancellationToken);

        return TokensIssued(tokens.AccessToken, tokens.RefreshToken.Value, grant.Access.Scope);
    }

    private async Task<IResult> RefreshAccessToken(
        IFormCollection form,
        string clientId,
        CancellationToken cancellationToken)
    {
        var refreshToken = tokenService.ValidateRefreshToken(SingleValue(form, "refresh_token") ?? string.Empty);

        if (refreshToken is null || refreshToken.Access.ClientId != clientId)
        {
            return Error("invalid_grant", "Refresh token is invalid or expired");
        }

        var tokens = tokenService.RotateTokens(refreshToken);

        var rotated = await rotateRefreshTokenHandler.Handle(
            new RotateRefreshTokenCommand(
                refreshToken.Id,
                refreshToken.FamilyId,
                tokens.RefreshToken.Id,
                tokens.RefreshToken.ExpiresAt),
            cancellationToken);

        if (!rotated)
        {
            return Error("invalid_grant", "Refresh token was already used or revoked");
        }

        return TokensIssued(tokens.AccessToken, tokens.RefreshToken.Value, refreshToken.Access.Scope);
    }

    private IResult TokensIssued(string accessToken, string refreshToken, string scope)
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
