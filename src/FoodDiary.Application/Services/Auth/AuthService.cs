using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.Application.Services.Auth;

internal class AuthService : IAuthService
{
    public Task<AuthResponseDto> SignInWithGoogleAsync(SignInWithGoogleRequestDto request, CancellationToken cancellationToken)
    {
        throw new System.NotImplementedException();
    }
}