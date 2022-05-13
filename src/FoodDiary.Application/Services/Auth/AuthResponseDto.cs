namespace FoodDiary.Application.Services.Auth;

public class AuthResponseDto
{
    public string AccessToken { get; set; }

    public int TokenExpirationDays { get; set; }
}