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
        UrlEncoder encoder) : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Options.ShouldAuthenticate)
        {
            return Task.FromResult(
                AuthenticateResult.Fail($"User '{Options.UserEmail}' was not authenticated by fake auth"));
        }

        var claims = new List<Claim>();

        if (Options.UserEmail is not null)
        {
            claims.Add(new Claim(Constants.ClaimTypes.Email, Options.UserEmail));
        }

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);

        var properties = new AuthenticationProperties
        {
            IssuedUtc = Options.IssuedUtc
        };

        var tokens = CreateTokens();
        properties.StoreTokens(tokens);

        var ticket = new AuthenticationTicket(principal, properties, Scheme.Name);
        var result = AuthenticateResult.Success(ticket);
        
        return Task.FromResult(result);
    }

    private static IEnumerable<AuthenticationToken> CreateTokens()
    {
        return
        [
            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.AccessToken,
                Value = "fake_access_token"
            },

            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.RefreshToken,
                Value = "fake_refresh_token"
            }
        ];
    }
}