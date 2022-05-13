using System.Threading.Tasks;
using Google.Apis.Auth;

namespace FoodDiary.Application.Services.Auth;

internal class TokenValidator : ITokenValidator
{
    public async Task<GoogleTokenInfoDto> ValidateAsync(string idToken)
    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken);

            return new GoogleTokenInfoDto
            {
                Email = payload.Email
            };
        }
        catch (InvalidJwtException)
        {
            return null;
        }
    }
}