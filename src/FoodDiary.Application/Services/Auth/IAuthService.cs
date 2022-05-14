using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.Application.Services.Auth;

public interface IAuthService
{
    Task<SignInWithGoogleResponseDto> SignInWithGoogleAsync(SignInWithGoogleRequestDto request,
        CancellationToken cancellationToken);
}