using FoodDiary.Integrations.Google.Contracts;

namespace FoodDiary.Integrations.Google;

internal class GoogleOAuthClient : IGoogleOAuthClient
{
    public Task<GoogleTokenInfoDto> ValidateTokenAsync(string tokenId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}