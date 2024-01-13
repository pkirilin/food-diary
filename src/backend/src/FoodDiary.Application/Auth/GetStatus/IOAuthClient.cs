using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;

namespace FoodDiary.Application.Auth.GetStatus;

public abstract record RefreshTokenResult
{
    public record Error : RefreshTokenResult;

    [PublicAPI]
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

    [PublicAPI]
    public record Success : GetUserInfoResult;
}

public interface IOAuthClient
{
    Task<RefreshTokenResult> RefreshToken(string currentRefreshToken, CancellationToken cancellationToken);
    
    Task<GetUserInfoResult> GetUserInfo(string accessToken, CancellationToken cancellationToken);
}