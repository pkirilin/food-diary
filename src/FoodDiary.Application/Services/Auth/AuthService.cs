using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Configuration;
using FoodDiary.Domain.Exceptions;
using Microsoft.Extensions.Options;

namespace FoodDiary.Application.Services.Auth;

internal class AuthService : IAuthService
{
    private readonly IOptions<AuthOptions> _options;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IGoogleTokenValidator _googleTokenValidator;

    public AuthService(IOptions<AuthOptions> options,
        IJwtTokenGenerator jwtTokenGenerator,
        IGoogleTokenValidator googleTokenValidator)
    {
        _options = options;
        _jwtTokenGenerator = jwtTokenGenerator;
        _googleTokenValidator = googleTokenValidator;
    }
    
    public async Task<SignInWithGoogleResponseDto> SignInWithGoogleAsync(SignInWithGoogleRequestDto request,
        CancellationToken cancellationToken)
    {
        var tokenInfo = await _googleTokenValidator.ValidateAsync(request.GoogleTokenId);

        if (tokenInfo == null)
        {
            throw new AccessDeniedException("Google token is invalid");
        }
        
        if (!_options.Value.AllowedEmails.Contains(tokenInfo.Email))
        {
            throw new AccessDeniedException($"Access denied - email '{tokenInfo.Email}' is not allowed");
        }
            
        var accessToken = _jwtTokenGenerator.GenerateToken(tokenInfo.Email);

        return new SignInWithGoogleResponseDto
        {
            AccessToken = accessToken,
            TokenExpirationDays = _options.Value.JwtExpirationDays,
        };
    }
}