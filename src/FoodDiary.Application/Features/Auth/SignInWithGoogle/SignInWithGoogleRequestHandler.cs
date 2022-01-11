using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Contracts.Auth;
using MediatR;

namespace FoodDiary.Application.Features.Auth.SignInWithGoogle;

internal class SignInWithGoogleRequestHandler : IRequestHandler<SignInWithGoogleRequest, SuccessfulAuthResponseDto>
{
    public Task<SuccessfulAuthResponseDto> Handle(SignInWithGoogleRequest request, CancellationToken cancellationToken)
    {
        throw new System.NotImplementedException();
    }
}