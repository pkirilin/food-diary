using Microsoft.AspNetCore.Authentication;

namespace FoodDiary.ComponentTests.Infrastructure.Auth;

public class FakeAuthenticationHandlerOptions : AuthenticationSchemeOptions
{
    public string? UserEmail { get; set; }
    
    public bool ShouldAuthenticate { get; set; }

    public DateTimeOffset? IssuedUtc { get; set; }
}