using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Application.Services.Auth;

[SuppressMessage("ReSharper", "PropertyCanBeMadeInitOnly.Global")]
public class SignInWithGoogleResponseDto
{
    public string AccessToken { get; set; }

    public int TokenExpirationDays { get; set; }
}