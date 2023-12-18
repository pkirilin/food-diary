using FoodDiary.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure.Auth;

public static class AuthExtensions
{
    private const string FakeSchemeName = "Fake";

    public static void AddFakeAuthForTests(this IServiceCollection services, AuthOptions authOptions)
    {
        var fakeUserEmail = authOptions.AllowedEmails.First();
        
        services.AddAuthentication(FakeSchemeName)
            .AddScheme<FakeAuthenticationHandlerOptions, FakeAuthenticationHandler>(
                FakeSchemeName,
                "Fake auth for tests",
                options => { options.UserEmail = fakeUserEmail; });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(Constants.AuthorizationPolicies.GoogleAllowedEmails, policy =>
            {
                policy.AddAuthenticationSchemes(FakeSchemeName)
                    .RequireAuthenticatedUser()
                    .RequireClaim(Constants.ClaimTypes.Email, fakeUserEmail);
            });
        });
    }
}