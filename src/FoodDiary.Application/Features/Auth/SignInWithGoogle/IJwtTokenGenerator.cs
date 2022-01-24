namespace FoodDiary.Application.Features.Auth.SignInWithGoogle;

public interface IJwtTokenGenerator
{
    string GenerateToken(string email);
}