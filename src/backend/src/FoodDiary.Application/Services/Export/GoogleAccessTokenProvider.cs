#nullable enable
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.Application.Services.Export;

internal class GoogleAccessTokenProvider : IGoogleAccessTokenProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GoogleAccessTokenProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }
    
    public async Task<string?> GetAccessTokenAsync()
    {
        if (_httpContextAccessor.HttpContext == null)
        {
            return null;
        }
        
        var auth = await _httpContextAccessor.HttpContext.AuthenticateAsync(Constants.AuthenticationSchemes.OAuthGoogle);
        var accessToken = auth.Properties?.GetTokenValue("access_token");
        return accessToken;
    }
}