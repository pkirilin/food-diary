using System.Threading.Tasks;
using FoodDiary.Application.Services.Auth;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleTokenValidator : IGoogleTokenValidator
{
    public const string TargetUserToken = "test_google_token_id";
    public const string AnotherUserToken = "test_google_token_id2";
    
    public Task<GoogleTokenInfoDto?> ValidateAsync(string idToken)
    {
        return idToken switch
        {
            TargetUserToken => Task.FromResult<GoogleTokenInfoDto?>(new GoogleTokenInfoDto
            {
                Email = "test@example.com"
            }),
            
            AnotherUserToken => Task.FromResult<GoogleTokenInfoDto?>(new GoogleTokenInfoDto
            {
                Email = "test2@example.com"
            }),
            
            _ => Task.FromResult<GoogleTokenInfoDto?>(null)
        };
    }
}