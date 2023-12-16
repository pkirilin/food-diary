using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure.Auth;

public static class AuthExtensions
{
    private const string FakeSchemeName = "Fake";
    private const string FakeUserEmail = "fake.user@gmail.com";

    public static void AddFakeAuthForTests(this IServiceCollection services)
    {
        services.AddAuthentication(FakeSchemeName)
            .AddScheme<FakeAuthenticationHandlerOptions, FakeAuthenticationHandler>(
                FakeSchemeName,
                "Fake auth for tests",
                options => { options.UserEmail = FakeUserEmail; });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(Constants.AuthorizationPolicies.GoogleAllowedEmails, policy =>
            {
                policy.AddAuthenticationSchemes(FakeSchemeName)
                    .RequireAuthenticatedUser()
                    .RequireClaim(Constants.ClaimTypes.Email, FakeUserEmail);
            });
        });
    }
}