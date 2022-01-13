using System.Diagnostics.CodeAnalysis;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Auth;
using FoodDiary.Integrations.Google;
using MediatR;

namespace FoodDiary.Application.Features.Auth.SignInWithGoogle;

[SuppressMessage("ReSharper", "UnusedType.Global")]
internal class SignInWithGoogleRequestHandler : IRequestHandler<SignInWithGoogleRequest, SuccessfulAuthResponseDto>
{
    private readonly IGoogleOAuthClient _googleOAuthClient;

    public SignInWithGoogleRequestHandler(IGoogleOAuthClient googleOAuthClient)
    {
        _googleOAuthClient = googleOAuthClient;
    }
    
    public async Task<SuccessfulAuthResponseDto> Handle(SignInWithGoogleRequest request,
        CancellationToken cancellationToken)
    {
        var tokenInfo = await _googleOAuthClient.ValidateTokenAsync(request.GoogleTokenId, cancellationToken);
        
        throw new System.NotImplementedException();
    }
}