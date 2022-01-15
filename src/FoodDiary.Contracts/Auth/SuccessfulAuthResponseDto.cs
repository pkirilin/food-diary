using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Contracts.Auth;

[SuppressMessage("ReSharper", "PropertyCanBeMadeInitOnly.Global")]
public class SuccessfulAuthResponseDto
{
    public string AccessToken { get; set; }
}