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
    private readonly ITokenValidator _tokenValidator;

    public AuthService(IOptions<AuthOptions> options, IJwtTokenGenerator jwtTokenGenerator, ITokenValidator tokenValidator)
    {
        _options = options;
        _jwtTokenGenerator = jwtTokenGenerator;
        _tokenValidator = tokenValidator;
    }
    
    public async Task<AuthResponseDto> SignInWithGoogleAsync(SignInWithGoogleRequestDto request, CancellationToken cancellationToken)
    {
        var tokenInfo = await _tokenValidator.ValidateAsync(request.GoogleTokenId);

        if (tokenInfo == null)
        {
            throw new AccessDeniedException("Google token is invalid");
        }
        
        if (!_options.Value.AllowedEmails.Contains(tokenInfo.Email))
        {
            throw new AccessDeniedException($"Access denied - email '{tokenInfo.Email}' is not allowed");
        }
            
        var accessToken = _jwtTokenGenerator.GenerateToken(tokenInfo.Email);

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            TokenExpirationDays = _options.Value.JwtExpirationDays,
        };
    }
}