using System.Threading.Tasks;
using FoodDiary.Integrations.Google.Contracts;

namespace FoodDiary.Application.Services.Auth;

public interface ITokenValidator
{
    Task<GoogleTokenInfoDto> ValidateAsync(string idToken);
}