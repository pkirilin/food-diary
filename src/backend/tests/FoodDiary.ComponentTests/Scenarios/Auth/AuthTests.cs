using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Auth;

public class AuthTests : ScenarioBase<AuthContext>
{
    public AuthTests(FoodDiaryWebApplicationFactory factory) : base(factory, () => new AuthContext(factory))
    {
    }

    [Scenario]
    [InlineData("/api/v1/pages")]
    [InlineData("/api/v1/notes")]
    [InlineData("/api/v1/products")]
    [InlineData("/api/v1/categories")]
    public Task I_cannot_use_app_when_my_email_is_not_allowed(string resourcePath)
    {
        return Run(
            c => c.Given_authenticated_user("forbidden.user@gmail.com"),
            c => c.When_user_is_trying_to_access_resource(resourcePath),
            c => c.Then_access_is_forbidden());
    }
}