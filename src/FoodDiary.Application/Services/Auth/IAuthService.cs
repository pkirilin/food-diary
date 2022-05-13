using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.Application.Services.Auth;

public interface IAuthService
{
    Task<AuthResponseDto> SignInWithGoogleAsync(SignInWithGoogleRequestDto request, CancellationToken cancellationToken);
}