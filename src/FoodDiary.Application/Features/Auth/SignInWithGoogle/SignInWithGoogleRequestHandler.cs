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

    public SignInWithGoogleRequestHandler(IGoogleOAuthClient googleOAuthClient, IOptions<AuthOptions> authOptions)
    {
        _googleOAuthClient = googleOAuthClient;
        _authOptions = authOptions;
    }
    
    public async Task<SuccessfulAuthResponseDto> Handle(SignInWithGoogleRequest request,
        CancellationToken cancellationToken)
    {
        var tokenInfo = await _googleOAuthClient.ValidateTokenAsync(request.GoogleTokenId, cancellationToken);

        if (!_authOptions.Value.AllowedEmails.Contains(tokenInfo.Email))
        {
            throw new AccessDeniedException($"Access denied - email '{tokenInfo.Email}' is not allowed");
        }

        throw new System.NotImplementedException();
    }
}