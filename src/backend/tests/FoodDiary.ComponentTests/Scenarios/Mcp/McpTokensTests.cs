using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

public class McpTokensTests(InfrastructureFixture infrastructure) : BaseTest<McpTokensContext>(infrastructure)
{
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
    public Task The_cimd_client_can_keep_refreshing_with_each_new_refresh_token()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_owner_approves_consent(),
            c => c.When_cimd_client_exchanges_authorization_code(),
            c => c.When_cimd_client_refreshes_access_token(),
            c => c.When_cimd_client_refreshes_access_token(),
            c => c.Then_every_refresh_returns_new_refresh_token());
    }

    [Scenario]
    [InlineData("component-tests", "wrong-secret")]
    [InlineData("component-tests", null)]
    [InlineData("unknown-client", null)]
    public Task The_client_cannot_exchange_authorization_code_without_authenticating(
        string clientId,
        string? clientSecret)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authorization_code_was_issued(),
            c => c.When_client_exchanges_authorization_code_as(clientId, clientSecret),
            c => c.Then_client_authentication_fails_with("Client authentication failed"));
    }

    [Scenario]
    public Task The_cimd_client_cannot_exchange_authorization_code_without_code_verifier()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_owner_approves_consent(),
            c => c.When_cimd_client_exchanges_authorization_code_without_code_verifier(),
            c => c.Then_code_exchange_is_refused());
    }

    [Scenario]
    public Task The_cimd_client_sending_client_secret_cannot_exchange_authorization_code()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_owner_approves_consent(),
            c => c.When_cimd_client_exchanges_authorization_code_with_client_secret("component-tests-secret"),
            c => c.Then_client_authentication_fails_with(
                "Clients identified by a client ID metadata document are public and must not send client_secret"));
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
            c => c.Then_client_receives_new_access_and_refresh_tokens());
    }

    [Scenario]
    public Task The_client_can_keep_refreshing_with_each_new_refresh_token()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authorization_code_was_issued(),
            c => c.When_client_exchanges_authorization_code(),
            c => c.When_client_refreshes_access_token(),
            c => c.When_client_refreshes_access_token(),
            c => c.When_client_refreshes_access_token(),
            c => c.Then_every_refresh_returns_new_refresh_token());
    }

    [Scenario]
    public Task The_client_reusing_refresh_token_loses_all_refresh_tokens_issued_after_it()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authorization_code_was_issued(),
            c => c.When_client_exchanges_authorization_code(),
            c => c.When_client_refreshes_access_token(),
            c => c.When_client_refreshes_access_token_with_first_refresh_token(),
            c => c.When_client_refreshes_access_token(),
            c => c.Then_only_the_first_refresh_succeeds());
    }

    [Scenario]
    public Task The_client_cannot_refresh_with_refresh_token_issued_before_rotation()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_refresh_token_was_issued_before_rotation(),
            c => c.When_client_refreshes_access_token(),
            c => c.Then_refresh_is_refused());
    }

    [Scenario]
    public Task The_client_cannot_refresh_with_refresh_token_that_was_never_recorded()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_refresh_token_was_issued_but_never_recorded(),
            c => c.When_client_refreshes_access_token(),
            c => c.Then_refresh_is_refused());
    }

    [Scenario]
    public Task The_client_cannot_refresh_with_refresh_token_past_its_lifetime()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authorization_code_was_issued(),
            c => c.When_client_exchanges_authorization_code(),
            c => c.When_days_pass(30),
            c => c.When_client_refreshes_access_token(),
            c => c.Then_refresh_is_refused());
    }

    [Scenario]
    public Task The_client_that_keeps_refreshing_stays_connected_beyond_one_refresh_token_lifetime()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authorization_code_was_issued(),
            c => c.When_client_exchanges_authorization_code(),
            c => c.When_days_pass(20),
            c => c.When_client_refreshes_access_token(),
            c => c.When_days_pass(20),
            c => c.When_client_refreshes_access_token(),
            c => c.Then_every_refresh_returns_new_refresh_token());
    }

    [Scenario]
    public Task The_client_cannot_refresh_twice_at_once_with_one_refresh_token()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authorization_code_was_issued(),
            c => c.When_client_exchanges_authorization_code(),
            c => c.When_client_refreshes_access_token_twice_at_once(),
            c => c.Then_only_one_refresh_succeeds());
    }
}
