using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Auth.GetStatus;
using FoodDiary.Contracts.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    [HttpGet("login")]
    public IActionResult Login([FromQuery] string? returnUrl)
    {
        var redirectUrl = Url.Action("LoginCallback", "Auth", new { returnUrl });

        var properties = new AuthenticationProperties
        {
            RedirectUri = redirectUrl,
            AllowRefresh = true
        };

        return Challenge(properties, Constants.AuthenticationSchemes.OAuthGoogle);
    }

    [HttpGet("login-callback")]
    public IActionResult LoginCallback(string returnUrl = "/")
    {
        return Redirect($"/#/post-login?returnUrl={Uri.EscapeDataString(returnUrl)}");
    }

    [HttpGet("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(Constants.AuthenticationSchemes.Cookie);
        return SignOut(Constants.AuthenticationSchemes.Cookie);
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(
        [FromServices] GetAuthStatusQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var authResult = await HttpContext.AuthenticateAsync(Constants.AuthenticationSchemes.OAuthGoogle);
        var result = await handler.Handle(new GetAuthStatusQuery(authResult), cancellationToken);

        return result switch
        {
            GetAuthStatusResult.Authenticated => Ok(new GetAuthStatusResponse { IsAuthenticated = true }),
            _ => Ok(new GetAuthStatusResponse { IsAuthenticated = false })
        };
    }
}
