using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.Application.Auth.GetUserProfile;

public abstract record RefreshTokenResult
{
    public record Error : RefreshTokenResult;

    public record Success(
        string AccessToken,
        string IdToken,
        string RefreshToken,
        string TokenType,
        int ExpiresIn) : RefreshTokenResult;
}

public record GetUserInfoResult
{
    public record Error : GetUserInfoResult;
    public record Success : GetUserInfoResult;
}

public interface IOAuthClient
{
    Task<RefreshTokenResult> RefreshToken(string currentRefreshToken, CancellationToken cancellationToken);
    
    Task<GetUserInfoResult> GetUserInfo(CancellationToken cancellationToken);
}