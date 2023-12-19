using FoodDiary.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure.Auth;

public static class FakeAuthExtensions
{
    private const string FakeSchemeName = "Fake";

    public static void AddFakeAuthForTests(
        this IServiceCollection services,
        AuthOptions authOptions,
        Action<FakeAuthenticationHandlerOptions> configureOptions)
    {
        services.AddAuthentication(FakeSchemeName)
            .AddScheme<FakeAuthenticationHandlerOptions, FakeAuthenticationHandler>(
                FakeSchemeName,
                "Fake auth for tests",
                configureOptions);

        services.AddAuthorization(options =>
        {
            options.AddPolicy(Constants.AuthorizationPolicies.GoogleAllowedEmails, policy =>
            {
                policy.AddAuthenticationSchemes(FakeSchemeName)
                    .RequireAuthenticatedUser()
                    .RequireClaim(Constants.ClaimTypes.Email, authOptions.AllowedEmails);
            });
        });
    }
}