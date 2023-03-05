using System.Threading.Tasks;

namespace FoodDiary.Application.Services.Export;

public interface IGoogleAccessTokenProvider
{
    Task<string> GetAccessTokenAsync();
}