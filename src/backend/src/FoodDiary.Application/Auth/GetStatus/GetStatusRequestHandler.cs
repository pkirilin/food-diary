using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.Application.Auth.GetStatus;

public record GetStatusRequest(AuthenticateResult? AuthResult) : IRequest<GetStatusResult>;

public abstract record GetStatusResult
{
    public record NotAuthenticated : GetStatusResult;
    public record Authenticated : GetStatusResult;
}

[UsedImplicitly]
internal class GetStatusRequestHandler : IRequestHandler<GetStatusRequest, GetStatusResult>
{
    private readonly TimeProvider _timeProvider;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IOAuthClient _oAuthClient;

    public GetStatusRequestHandler(
        TimeProvider timeProvider,
        IHttpContextAccessor httpContextAccessor,
        IOAuthClient oAuthClient)
    {
        _timeProvider = timeProvider;
        _httpContextAccessor = httpContextAccessor;
        _oAuthClient = oAuthClient;
    }
    
    public async Task<GetStatusResult> Handle(GetStatusRequest request, CancellationToken cancellationToken)
    {
        if (request.AuthResult is null ||
            !request.AuthResult.Succeeded ||
            !request.AuthResult.Properties.IssuedUtc.HasValue)
        {
            return new GetStatusResult.NotAuthenticated();
        }

        if (!ExistingTokenExpired(request.AuthResult.Properties.IssuedUtc.Value))
        {
            return new GetStatusResult.Authenticated();
        }
        
        var accessToken = request.AuthResult.Properties.GetTokenValue(Constants.OpenIdConnectParameters.AccessToken);
        var refreshToken = request.AuthResult.Properties.GetTokenValue(Constants.OpenIdConnectParameters.RefreshToken);

        if (string.IsNullOrWhiteSpace(accessToken) || string.IsNullOrWhiteSpace(refreshToken))
        {
            return await NotAuthenticated();
        }

        var refreshTokenResult = await _oAuthClient.RefreshToken(refreshToken, cancellationToken);

        if (refreshTokenResult is not RefreshTokenResult.Success refreshTokenResponse)
        {
            return await NotAuthenticated();
        }

        var userInfoResult = await _oAuthClient.GetUserInfo(accessToken, cancellationToken);

        if (userInfoResult is GetUserInfoResult.Error)
        {
            return await NotAuthenticated();
        }

        var tokens = CreateNewTokens(refreshTokenResponse);

        return await AuthenticatedWithNewTokens(request.AuthResult, tokens);
    }

    private bool ExistingTokenExpired(DateTimeOffset existingTokenIssuedOn)
    {
        var accessTokenExpirationDate = existingTokenIssuedOn
            .Add(Constants.AuthenticationParameters.AccessTokenRefreshInterval);
        
        var currentDate = _timeProvider.GetUtcNow();

        return currentDate > accessTokenExpirationDate;
    }
    
    private async Task<GetStatusResult> NotAuthenticated()
    {
        await _httpContextAccessor.HttpContext.SignOutAsync(Constants.AuthenticationSchemes.Cookie);
        return new GetStatusResult.NotAuthenticated();
    }

    private async Task<GetStatusResult> AuthenticatedWithNewTokens(
        AuthenticateResult authResult,
        IEnumerable<AuthenticationToken> tokens)
    {
        authResult.Properties.StoreTokens(tokens);
        authResult.Properties.Items.Remove(".issued");
        authResult.Properties.Items.Remove(".expires");
        
        await _httpContextAccessor.HttpContext.SignInAsync(
            Constants.AuthenticationSchemes.Cookie,
            authResult.Principal,
            authResult.Properties);

        return new GetStatusResult.Authenticated();
    }

    private IEnumerable<AuthenticationToken> CreateNewTokens(RefreshTokenResult.Success refreshTokenResponse)
    {
        var expiresAt = _timeProvider.GetUtcNow() + TimeSpan.FromSeconds(refreshTokenResponse.ExpiresIn);
        
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
                Value = refreshTokenResponse.RefreshToken
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