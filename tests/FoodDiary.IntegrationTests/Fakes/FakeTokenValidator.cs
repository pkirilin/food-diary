using System.Threading.Tasks;
using FoodDiary.Application.Services.Auth;
using FoodDiary.Integrations.Google.Contracts;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeTokenValidator : ITokenValidator
{
    public const string TargetUserToken = "test_google_token_id";
    public const string AnotherUserToken = "test_google_token_id2";
    
    public Task<GoogleTokenInfoDto> ValidateAsync(string idToken)
    {
        if (idToken == TargetUserToken)
        {
            return Task.FromResult(new GoogleTokenInfoDto
            {
                Email = "test@example.com"
            });
        }

        if (idToken == AnotherUserToken)
        {
            return Task.FromResult(new GoogleTokenInfoDto
            {
                Email = "test2@example.com"
            });
        }
        
        return Task.FromResult<GoogleTokenInfoDto>(null!);
    }
}