using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.ComponentTests.Infrastructure.Auth;

public class FakeAuthenticationService(
    FakeAuthenticationHandler handler,
    IAuthenticationSchemeProvider authenticationSchemeProvider)
    : IAuthenticationService
{
    public async Task<AuthenticateResult> AuthenticateAsync(HttpContext context, string? schemeName)
    {
        var scheme = await authenticationSchemeProvider.GetSchemeAsync(schemeName!);
        await handler.InitializeAsync(scheme!, context);
        var authResult = await handler.AuthenticateAsync();
        return authResult;
    }

    public Task ChallengeAsync(HttpContext context, string? scheme, AuthenticationProperties? properties)
    {
        return Task.CompletedTask;
    }

    public Task ForbidAsync(HttpContext context, string? schemeName, AuthenticationProperties? properties)
    {
        return handler.ForbidAsync(properties);
    }

    public Task SignInAsync(
        HttpContext context,
        string? scheme,
        ClaimsPrincipal principal,
        AuthenticationProperties? properties)
    {
        return Task.CompletedTask;
    }

    public Task SignOutAsync(HttpContext context, string? scheme, AuthenticationProperties? properties)
    {
        return Task.CompletedTask;
    }
}