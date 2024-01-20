using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FoodDiary.Application.Auth.GetStatus;

public record GetStatusRequest(AuthenticateResult? AuthResult) : IRequest<GetStatusResult>;

public abstract record GetStatusResult
{
    public record NotAuthenticated : GetStatusResult;
    public record Authenticated : GetStatusResult;
}

[UsedImplicitly]
internal class GetStatusRequestHandler(
    TimeProvider timeProvider,
    IHttpContextAccessor httpContextAccessor,
    IOAuthClient oAuthClient,
    ILogger<GetStatusRequestHandler> logger) : IRequestHandler<GetStatusRequest, GetStatusResult>
{
    public async Task<GetStatusResult> Handle(GetStatusRequest request, CancellationToken cancellationToken)
    {
        if (request.AuthResult is null ||
            !request.AuthResult.Succeeded ||
            !request.AuthResult.Properties.IssuedUtc.HasValue)
        {
            return new GetStatusResult.NotAuthenticated();
        }
        
        var userEmail = request.AuthResult.Principal.FindFirst(Constants.ClaimTypes.Email)?.Value;
        logger.LogInformation("Checking access token for user {UserEmail}...", userEmail);
        
        if (!ExistingTokenExpired(request.AuthResult.Properties.IssuedUtc.Value))
        {
            logger.LogInformation("User {UserEmail} has been successfully authenticated", userEmail);
            return new GetStatusResult.Authenticated();
        }
        
        logger.LogInformation("Access token for user {UserEmail} expired. Attempting to refresh token...", userEmail);
        
        var existingAccessToken = request.AuthResult.Properties.GetTokenValue(Constants.OpenIdConnectParameters.AccessToken);
        var existingRefreshToken = request.AuthResult.Properties.GetTokenValue(Constants.OpenIdConnectParameters.RefreshToken);

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

        return await AuthenticatedWithNewTokens(request.AuthResult, tokens, userEmail);
    }

    private bool ExistingTokenExpired(DateTimeOffset existingTokenIssuedOn)
    {
        var accessTokenExpirationDate = existingTokenIssuedOn + Constants.AuthenticationParameters.AccessTokenRefreshInterval;
        var currentDate = timeProvider.GetUtcNow();
        
        return currentDate > accessTokenExpirationDate;
    }
    
    private async Task<GetStatusResult> NotAuthenticated()
    {
        await httpContextAccessor.HttpContext.SignOutAsync(Constants.AuthenticationSchemes.Cookie);
        return new GetStatusResult.NotAuthenticated();
    }

    private async Task<GetStatusResult> AuthenticatedWithNewTokens(
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

        return new GetStatusResult.Authenticated();
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