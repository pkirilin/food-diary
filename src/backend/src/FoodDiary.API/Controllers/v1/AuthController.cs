using System;
using System.Threading.Tasks;
using FoodDiary.Application.Auth.GetStatus;
using FoodDiary.Contracts.Auth;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

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
        return Redirect($"/post-login?returnUrl={Uri.EscapeDataString(returnUrl)}");
    }

    [HttpGet("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(Constants.AuthenticationSchemes.Cookie);
        return SignOut(Constants.AuthenticationSchemes.Cookie);
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var authResult = await HttpContext.AuthenticateAsync(Constants.AuthenticationSchemes.OAuthGoogle);
        var request = new GetStatusRequest(authResult);
        var result = await _sender.Send(request);

        return result switch
        {
            GetStatusResult.Authenticated => Ok(new GetAuthStatusResponse { IsAuthenticated = true }),
            _ => Ok(new GetAuthStatusResponse { IsAuthenticated = false })
        };
    }
}