#nullable enable
using System.Threading.Tasks;

namespace FoodDiary.Application.Services.Auth;

public interface IGoogleTokenValidator
{
    Task<GoogleTokenInfoDto?> ValidateAsync(string idToken);
}