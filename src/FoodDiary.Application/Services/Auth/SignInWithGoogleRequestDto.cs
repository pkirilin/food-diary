using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Application.Services.Auth;

[SuppressMessage("ReSharper", "PropertyCanBeMadeInitOnly.Global")]
public class SignInWithGoogleRequestDto
{
    public string GoogleTokenId { get; set; }
}