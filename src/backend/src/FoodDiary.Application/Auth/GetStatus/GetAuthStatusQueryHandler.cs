using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FoodDiary.Application.Auth.GetStatus;

public record GetAuthStatusQuery(AuthenticateResult? AuthResult);

public abstract record GetAuthStatusResult
{
    public record NotAuthenticated : GetAuthStatusResult;

    public record Authenticated : GetAuthStatusResult;
}

public class GetAuthStatusQueryHandler(
    TimeProvider timeProvider,
    IHttpContextAccessor httpContextAccessor,
    IOAuthClient oAuthClient,
    ILogger<GetAuthStatusQueryHandler> logger)
{
    public async Task<GetAuthStatusResult> Handle(GetAuthStatusQuery query, CancellationToken cancellationToken)
    {
        if (query.AuthResult is null ||
            !query.AuthResult.Succeeded ||
            !query.AuthResult.Properties.IssuedUtc.HasValue)
        {
            return new GetAuthStatusResult.NotAuthenticated();
        }

        var userEmail = query.AuthResult.Principal.FindFirst(Constants.ClaimTypes.Email)?.Value;
        logger.LogInformation("Checking access token for user {UserEmail}...", userEmail);

        if (!ExistingTokenExpired(query.AuthResult.Properties.IssuedUtc.Value))
        {
            logger.LogInformation("User {UserEmail} has been successfully authenticated", userEmail);
            return new GetAuthStatusResult.Authenticated();
        }

        logger.LogInformation("Access token for user {UserEmail} expired. Attempting to refresh token...", userEmail);

        var existingAccessToken = query.AuthResult.Properties.GetTokenValue(Constants.OpenIdConnectParameters.AccessToken);
        var existingRefreshToken = query.AuthResult.Properties.GetTokenValue(Constants.OpenIdConnectParameters.RefreshToken);

        if (string.IsNullOrWhiteSpace(existingAccessToken) || string.IsNullOrWhiteSpace(existingRefreshToken))
        {
            logger.LogInformation("Access and/or refresh tokens for user {UserEmail} were not found", userEmail);
            return await NotAuthenticated();
        }

        var refreshTokenResult = await oAuthClient.RefreshToken(existingRefreshToken, cancellationToken);

        if (refreshTokenResult is not RefreshTokenResult.Success refreshTokenResponse)
        {
            logger.LogInformation("Could not refresh token for user {UserEmail}", userEmail);
            return await NotAuthenticated();
        }

        logger.LogInformation(
            "Token for user {UserEmail} has been successfully refreshed. Trying to get user info...",
            userEmail);

        var userInfoResult = await oAuthClient.GetUserInfo(refreshTokenResponse.AccessToken, cancellationToken);

        if (userInfoResult is GetUserInfoResult.Error)
        {
            logger.LogInformation("Could not retrieve user info for {UserEmail}", userEmail);
            return await NotAuthenticated();
        }

        var tokens = CreateNewTokens(refreshTokenResponse, existingRefreshToken);

        return await AuthenticatedWithNewTokens(query.AuthResult, tokens, userEmail);
    }

    private bool ExistingTokenExpired(DateTimeOffset existingTokenIssuedOn)
    {
        var accessTokenExpirationDate = existingTokenIssuedOn + Constants.AuthenticationParameters.AccessTokenRefreshInterval;
        var currentDate = timeProvider.GetUtcNow();

        return currentDate > accessTokenExpirationDate;
    }

    private async Task<GetAuthStatusResult> NotAuthenticated()
    {
        await httpContextAccessor.HttpContext.SignOutAsync(Constants.AuthenticationSchemes.Cookie);
        return new GetAuthStatusResult.NotAuthenticated();
    }

    private async Task<GetAuthStatusResult> AuthenticatedWithNewTokens(
        AuthenticateResult authResult,
        IEnumerable<AuthenticationToken> tokens,
        string? userEmail)
    {
        authResult.Properties.StoreTokens(tokens);
        authResult.Properties.Items.Remove(".issued");
        authResult.Properties.Items.Remove(".expires");

        await httpContextAccessor.HttpContext.SignInAsync(
            Constants.AuthenticationSchemes.Cookie,
            authResult.Principal,
            authResult.Properties);

        logger.LogInformation("User {UserEmail} has been successfully authenticated", userEmail);

        return new GetAuthStatusResult.Authenticated();
    }

    private IEnumerable<AuthenticationToken> CreateNewTokens(
        RefreshTokenResult.Success refreshTokenResponse,
        string existingRefreshToken)
    {
        var expiresAt = timeProvider.GetUtcNow() + TimeSpan.FromSeconds(refreshTokenResponse.ExpiresIn);

        return
        [
            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.AccessToken,
                Value = refreshTokenResponse.AccessToken
            },

            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.IdToken,
                Value = refreshTokenResponse.IdToken
            },

            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.RefreshToken,
                Value = existingRefreshToken
            },

            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.TokenType,
                Value = refreshTokenResponse.TokenType
            },

            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.ExpiresAt,
                Value = expiresAt.ToString("o", CultureInfo.InvariantCulture)
            }
        ];
    }
}
