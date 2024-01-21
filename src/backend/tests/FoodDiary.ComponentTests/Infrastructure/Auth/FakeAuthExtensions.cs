using FoodDiary.Configuration;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure.Auth;

public static class FakeAuthExtensions
{
    public static void AddFakeAuthForTests(
        this IServiceCollection services,
        AuthOptions authOptions,
        Action<FakeAuthenticationHandlerOptions> configureOptions)
    {
        services.AddAuthentication(FakeAuthConstants.SchemeName)
            .AddScheme<FakeAuthenticationHandlerOptions, FakeAuthenticationHandler>(
                FakeAuthConstants.SchemeName,
                FakeAuthConstants.SchemeDisplayName,
                configureOptions);
        
        services.AddSingleton<IAuthenticationSchemeProvider, FakeAuthenticationSchemeProvider>();
        services.AddSingleton<IAuthenticationService, FakeAuthenticationService>();

        services.AddAuthorization(options =>
        {
            options.AddPolicy(Constants.AuthorizationPolicies.GoogleAllowedEmails, policy =>
            {
                policy.AddAuthenticationSchemes(FakeAuthConstants.SchemeName)
                    .RequireAuthenticatedUser()
                    .RequireClaim(Constants.ClaimTypes.Email, authOptions.AllowedEmails);
            });
        });
    }
}