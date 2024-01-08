using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace FoodDiary.ComponentTests.Infrastructure.Auth;

public class FakeAuthenticationSchemeProvider : AuthenticationSchemeProvider
{
    public FakeAuthenticationSchemeProvider(IOptions<AuthenticationOptions> options) : base(options)
    {
    }

    protected FakeAuthenticationSchemeProvider(
        IOptions<AuthenticationOptions> options,
        IDictionary<string, AuthenticationScheme> schemes) : base(options, schemes)
    {
    }

    public override Task<AuthenticationScheme?> GetSchemeAsync(string name)
    {
        var scheme = new AuthenticationScheme(
            FakeAuthConstants.SchemeName,
            FakeAuthConstants.SchemeDisplayName,
            typeof(FakeAuthenticationHandler));
        
        return Task.FromResult(scheme)!;
    }
}