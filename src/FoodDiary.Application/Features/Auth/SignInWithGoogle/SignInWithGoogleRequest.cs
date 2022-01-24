using FoodDiary.Contracts.Auth;
using MediatR;

namespace FoodDiary.Application.Features.Auth.SignInWithGoogle;

public class SignInWithGoogleRequest : IRequest<SuccessfulAuthResponseDto>
{
    public string GoogleTokenId { get; set; }
}