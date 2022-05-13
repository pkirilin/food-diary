using System.Threading.Tasks;

namespace FoodDiary.Application.Services.Auth;

public interface ITokenValidator
{
    Task<GoogleTokenInfoDto> ValidateAsync(string idToken);
}