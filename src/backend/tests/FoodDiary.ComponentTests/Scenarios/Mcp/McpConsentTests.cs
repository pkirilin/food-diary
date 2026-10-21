using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

public class McpConsentTests(InfrastructureFixture infrastructure) : BaseTest<McpConsentContext>(infrastructure)
{
    [Scenario]
    public Task The_owner_is_sent_to_consent_page_when_cimd_client_requests_authorization()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_owner_opens_consent_page(),
            c => c.Then_consent_page_shows_client("https://client.example.com/logo.png", "127.0.0.1", true));
    }

    [Scenario]
    public Task The_owner_is_not_warned_about_localhost_when_cimd_client_also_lists_other_redirect_uris()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_with_logo_and_redirect_uris(
                "http://client.example.com/logo.png",
                "not a URL",
                "http://127.0.0.1:1456/callback",
                "https://client.example.com/callback"),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization_with("redirect_uri", "https://client.example.com/callback"),
            c => c.When_owner_opens_consent_page(),
            c => c.Then_consent_page_shows_client(null, "client.example.com", false));
    }

    [Scenario]
    public Task The_cimd_client_can_list_products_after_owner_approves_consent()
    {
        var oatmeal = Create.Product("Oatmeal").Please();

        return CtxRunner.RunScenarioAsync(
            c => c.Given_products(oatmeal),
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_owner_approves_consent(),
            c => c.When_cimd_client_exchanges_authorization_code(),
            c => c.When_mcp_client_calls_list_products("oat"),
            c => c.Then_consent_sends_cimd_client_back_with_code(),
            c => c.Then_client_receives_access_and_refresh_tokens(),
            c => c.Then_products_contain(oatmeal));
    }

    [Scenario]
    public Task The_cimd_client_learns_owner_denied_consent()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_owner_denies_consent(),
            c => c.Then_consent_sends_cimd_client_back_with_error("access_denied"));
    }

    [Scenario]
    public Task The_owner_can_decide_on_consent_request_within_10_minutes()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_minutes_pass(9),
            c => c.When_owner_opens_consent_page(),
            c => c.When_owner_approves_consent(),
            c => c.Then_consent_page_shows_client("https://client.example.com/logo.png", "127.0.0.1", true),
            c => c.Then_consent_sends_cimd_client_back_with_code());
    }

    [Scenario]
    public Task The_owner_cannot_decide_on_consent_request_after_10_minutes()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_minutes_pass(10),
            c => c.When_owner_opens_consent_page(),
            c => c.When_owner_approves_consent(),
            c => c.Then_consent_request_is_refused_as_expired());
    }

    [Scenario]
    public Task The_owner_cannot_decide_on_consent_request_twice()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_owner_approves_consent(),
            c => c.When_owner_opens_consent_page(),
            c => c.When_owner_denies_consent(),
            c => c.Then_consent_request_is_refused_as_expired_after_first_decision());
    }

    [Scenario]
    public Task The_owner_cannot_decide_on_tampered_consent_request()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_consent_request_is_tampered_with(),
            c => c.When_owner_opens_consent_page(),
            c => c.When_owner_approves_consent(),
            c => c.Then_consent_request_is_refused_as_expired());
    }

    [Scenario]
    public Task The_allowed_user_cannot_decide_on_consent_request_issued_to_another_allowed_user()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_another_allowed_user_is_signed_in(),
            c => c.When_owner_opens_consent_page(),
            c => c.When_owner_approves_consent(),
            c => c.Then_consent_request_is_refused_as_expired());
    }

    [Scenario]
    public Task The_owner_can_still_decide_on_consent_request_after_another_allowed_user_tried()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_another_allowed_user_is_signed_in(),
            c => c.When_owner_approves_consent(),
            c => c.When_owner_signs_in_again(),
            c => c.When_owner_approves_consent(),
            c => c.Then_consent_sends_cimd_client_back_with_code());
    }

    [Scenario]
    [InlineData("GET")]
    [InlineData("POST")]
    public Task The_owner_cannot_use_unknown_consent_request(string method)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user(),
            c => c.When_consent_api_is_called_with(method),
            c => c.Then_consent_request_is_refused_as_expired());
    }

    [Scenario]
    public Task The_owner_cannot_decide_on_null_consent_request()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user(),
            c => c.When_owner_approves_consent_with_null_consent_request(),
            c => c.Then_consent_request_is_refused_as_expired());
    }

    [Scenario]
    [InlineData("GET")]
    [InlineData("POST")]
    public Task The_owner_signs_in_before_using_consent_api(string method)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.When_consent_api_is_called_with(method),
            c => c.Then_consent_api_asks_owner_to_sign_in_with_google());
    }

    [Scenario]
    [InlineData("GET")]
    [InlineData("POST")]
    public Task The_account_not_allowed_cannot_use_consent_api(string method)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user("someone.else@gmail.com"),
            c => c.When_consent_api_is_called_with(method),
            c => c.Then_consent_api_is_forbidden());
    }

    [Scenario]
    public Task The_owner_decides_on_consent_only_with_json()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.When_owner_approves_consent_with_form_post(),
            c => c.Then_consent_decision_is_refused_as_unsupported_media_type());
    }
}
