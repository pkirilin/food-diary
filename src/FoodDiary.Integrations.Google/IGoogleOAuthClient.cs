using FoodDiary.Integrations.Google.Contracts;

namespace FoodDiary.Integrations.Google;

public interface IGoogleOAuthClient
{
    Task<GoogleTokenInfoDto> ValidateTokenAsync(string tokenId, CancellationToken cancellationToken);
}