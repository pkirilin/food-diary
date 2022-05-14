using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Services.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }
    
    [HttpPost("google")]
    [AllowAnonymous]
    public async Task<IActionResult> Google([FromBody] SignInWithGoogleRequestDto request, CancellationToken cancellationToken)
    {
        var response = await _authService.SignInWithGoogleAsync(request, cancellationToken);
        
        return Ok(response);
    }
}