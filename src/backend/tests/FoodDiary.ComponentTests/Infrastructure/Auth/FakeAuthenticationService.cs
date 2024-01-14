using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.ComponentTests.Infrastructure.Auth;

public class FakeAuthenticationService : IAuthenticationService
{
    private readonly FakeAuthenticationHandler _handler;
    private readonly IAuthenticationSchemeProvider _authenticationSchemeProvider;

    public FakeAuthenticationService(
        FakeAuthenticationHandler handler,
        IAuthenticationSchemeProvider authenticationSchemeProvider)
    {
        _handler = handler;
        _authenticationSchemeProvider = authenticationSchemeProvider;
    }
    
    public async Task<AuthenticateResult> AuthenticateAsync(HttpContext context, string? schemeName)
    {
        var scheme = await _authenticationSchemeProvider.GetSchemeAsync(schemeName!);
        await _handler.InitializeAsync(scheme!, context);
        var authResult = await _handler.AuthenticateAsync();
        return authResult;
    }

    public Task ChallengeAsync(HttpContext context, string? scheme, AuthenticationProperties? properties)
    {
        return Task.CompletedTask;
    }

    public Task ForbidAsync(HttpContext context, string? schemeName, AuthenticationProperties? properties)
    {
        return _handler.ForbidAsync(properties);
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