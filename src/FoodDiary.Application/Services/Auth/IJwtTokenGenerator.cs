namespace FoodDiary.Application.Services.Auth;

public interface IJwtTokenGenerator
{
    string GenerateToken(string email);
}