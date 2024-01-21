using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;

namespace FoodDiary.Application.Auth.GetStatus;

public abstract record RefreshTokenResult
{
    public record Error : RefreshTokenResult;

    [PublicAPI]
    public record Success(
        [property: JsonPropertyName("access_token")]
        string AccessToken,
        [property: JsonPropertyName("id_token")]
        string IdToken,
        [property: JsonPropertyName("token_type")]
        string TokenType,
        [property: JsonPropertyName("expires_in")]
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
    Task<RefreshTokenResult> RefreshToken(string refreshToken, CancellationToken cancellationToken);
    
    Task<GetUserInfoResult> GetUserInfo(string accessToken, CancellationToken cancellationToken);
}