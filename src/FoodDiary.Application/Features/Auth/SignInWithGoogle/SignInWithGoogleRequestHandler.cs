using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Configuration;
using FoodDiary.Contracts.Auth;
using FoodDiary.Domain.Exceptions;
using FoodDiary.Integrations.Google;
using MediatR;
using Microsoft.Extensions.Options;

namespace FoodDiary.Application.Features.Auth.SignInWithGoogle;

[SuppressMessage("ReSharper", "UnusedType.Global")]
internal class SignInWithGoogleRequestHandler : IRequestHandler<SignInWithGoogleRequest, SuccessfulAuthResponseDto>
{
    private readonly IGoogleOAuthClient _googleOAuthClient;
    private readonly IOptions<AuthOptions> _authOptions;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public SignInWithGoogleRequestHandler(IGoogleOAuthClient googleOAuthClient,
        IOptions<AuthOptions> authOptions,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _googleOAuthClient = googleOAuthClient;
        _authOptions = authOptions;
        _jwtTokenGenerator = jwtTokenGenerator;
    }
    
    public async Task<SuccessfulAuthResponseDto> Handle(SignInWithGoogleRequest request,
        CancellationToken cancellationToken)
    {
        var tokenInfo = await _googleOAuthClient.ValidateTokenAsync(request.GoogleTokenId, cancellationToken);

        if (tokenInfo == null)
        {
            throw new AccessDeniedException("Google token is invalid");
        }

        if (!_authOptions.Value.AllowedEmails.Contains(tokenInfo.Email))
        {
            throw new AccessDeniedException($"Access denied - email '{tokenInfo.Email}' is not allowed");
        }

        var accessToken = _jwtTokenGenerator.GenerateToken(tokenInfo.Email);

        return new SuccessfulAuthResponseDto
        {
            AccessToken = accessToken,
            TokenExpirationDays = _authOptions.Value.JwtExpirationDays,
        };
    }
}