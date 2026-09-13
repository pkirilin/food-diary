using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

public class McpApiTests(InfrastructureFixture infrastructure) : BaseTest<McpApiContext>(infrastructure)
{
    [Scenario]
    public Task The_client_can_discover_authorization_server()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.When_client_requests_authorization_server_metadata(),
            c => c.Then_authorization_server_metadata_is_built_from_base_url());
    }

    [Scenario]
    public Task The_client_can_exchange_authorization_code_for_access_and_refresh_tokens()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user(),
            c => c.When_client_requests_authorization(),
            c => c.When_client_exchanges_authorization_code(),
            c => c.Then_authorization_response_carries_state_and_issuer(),
            c => c.Then_client_receives_access_and_refresh_tokens());
    }

    [Scenario]
    public Task The_client_is_redirected_back_with_error_and_issuer_when_PKCE_is_not_S256()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.When_client_requests_authorization_with_code_challenge_method("plain"),
            c => c.Then_authorization_error_response_carries_state_and_issuer("invalid_request"));
    }

    [Scenario]
    public Task The_client_cannot_exchange_one_authorization_code_twice()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authorization_code_was_issued(),
            c => c.When_client_exchanges_authorization_code(),
            c => c.When_client_exchanges_authorization_code(),
            c => c.Then_only_the_first_code_exchange_succeeds());
    }

    [Scenario]
    public Task The_client_can_refresh_access_token()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authorization_code_was_issued(),
            c => c.When_client_exchanges_authorization_code(),
            c => c.When_client_refreshes_access_token(),
            c => c.Then_client_receives_new_access_token());
    }
}
