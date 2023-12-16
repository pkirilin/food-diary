using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FoodDiary.ComponentTests.Infrastructure.Auth;

public class FakeAuthenticationHandler : AuthenticationHandler<FakeAuthenticationHandlerOptions>
{
    public FakeAuthenticationHandler(
        IOptionsMonitor<FakeAuthenticationHandlerOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock) : base(options, logger, encoder, clock)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new List<Claim>();

        if (Options.UserEmail is not null)
        {
            claims.Add(new Claim(Constants.ClaimTypes.Email, Options.UserEmail));
        }

        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        var properties = new AuthenticationProperties(new Dictionary<string, string?>
        {
            [".Token.access_token"] = "test_google_access_token"
        });

        var ticket = new AuthenticationTicket(principal, properties, "Test");
        var result = AuthenticateResult.Success(ticket);
        return Task.FromResult(result);
    }
}