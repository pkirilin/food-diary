using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Auth;

public class AuthTests(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure) :
    ScenarioBase<AuthContext>(factory, infrastructure)
{
    protected override AuthContext CreateContext(
        FoodDiaryWebApplicationFactory factory,
        InfrastructureFixture infrastructure) => new(factory, infrastructure);
    
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

    [Scenario]
    public Task The_client_can_check_auth_status_and_keep_user_signed_in()
    {
        return Run(
            c => c.Given_authenticated_user_with_expired_access_token(),
            c => c.Given_google_identity_provider_is_ready(),
            c => c.Given_user_access_token_can_be_refreshed(),
            c => c.Given_user_info_can_be_retrieved(),
            c => c.When_client_checks_auth_status(),
            c => c.Then_user_is_authenticated());
    }
}