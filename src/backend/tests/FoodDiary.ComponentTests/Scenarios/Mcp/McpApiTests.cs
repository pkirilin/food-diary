using FoodDiary.ComponentTests.Dsl;
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
    public Task The_client_without_access_token_is_challenged_to_discover_protected_resource_metadata()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.When_client_calls_mcp_without_access_token(),
            c => c.When_client_requests_resource_metadata_from_challenge(),
            c => c.Then_client_is_challenged_with_resource_metadata_and_scope(),
            c => c.Then_resource_metadata_is_built_from_base_url());
    }

    [Scenario]
    [InlineData("POST", "/mcp")]
    [InlineData("GET", "/.well-known/oauth-protected-resource/mcp")]
    [InlineData("GET", "/.well-known/oauth-authorization-server")]
    [InlineData("GET", "/authorize")]
    [InlineData("POST", "/token")]
    public Task The_client_cannot_find_mcp_server_when_it_is_disabled(string method, string path)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_mcp_is_disabled(),
            c => c.When_client_requests(method, path),
            c => c.Then_response_is_not_found());
    }

    [Scenario]
    public Task The_client_with_access_token_can_connect()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_access_token_was_issued(),
            c => c.When_mcp_client_connects(),
            c => c.Then_mcp_client_is_connected());
    }

    [Scenario]
    public Task The_client_can_get_food_logs()
    {
        var note = Create.Note().WithDate("2026-09-01").WithProduct("Oatmeal", quantity: 60).Please();

        return CtxRunner.RunScenarioAsync(
            c => c.Given_notes(note),
            c => c.Given_access_token_was_issued(),
            c => c.When_mcp_client_calls_get_food_logs("2026-09-01", "2026-09-01"),
            c => c.Then_mcp_client_lists_tools("get_food_logs", "list_products"),
            c => c.Then_food_logs_contain(note));
    }

    [Scenario]
    public Task The_client_is_told_to_split_food_logs_range_wider_than_31_days()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_access_token_was_issued(),
            c => c.When_mcp_client_calls_get_food_logs("2026-09-01", "2026-10-02"),
            c => c.Then_tool_call_is_error("Requested 32 days; the maximum is 31. Split the range."));
    }

    [Scenario]
    public Task The_client_can_list_products()
    {
        var oatmeal = Create.Product("Oatmeal").Please();
        var apple = Create.Product("Apple").Please();

        return CtxRunner.RunScenarioAsync(
            c => c.Given_products(oatmeal, apple),
            c => c.Given_access_token_was_issued(),
            c => c.When_mcp_client_calls_list_products("oat"),
            c => c.Then_mcp_client_lists_tools("get_food_logs", "list_products"),
            c => c.Then_products_contain(oatmeal));
    }

    [Scenario]
    public Task The_client_can_get_nutrition_report_prompt()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_access_token_was_issued(),
            c => c.When_mcp_client_gets_nutrition_report_prompt("last 14 days"),
            c => c.Then_mcp_client_lists_prompts("nutrition_report"),
            c => c.Then_prompt_mentions("last 14 days"));
    }

    [Scenario]
    public Task The_client_with_access_token_of_user_no_longer_allowed_is_forbidden()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_access_token_was_issued_to("removed.user@gmail.com"),
            c => c.When_client_calls_mcp_with_access_token(),
            c => c.Then_access_is_forbidden());
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
    public Task The_owner_is_sent_to_consent_page_when_cimd_client_requests_authorization()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_owner_is_sent_to_consent_page_for_cimd_client());
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
            c => c.Then_consent_page_shows_client(null, "client.example.com", false));
    }

    [Scenario]
    public Task The_owner_signs_in_before_cimd_client_metadata_document_is_fetched()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_owner_is_asked_to_sign_in_with_google());
    }

    [Scenario]
    public Task The_owner_with_account_not_allowed_is_refused_before_cimd_client_metadata_document_is_fetched()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user("someone.else@gmail.com"),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with("This account is not allowed to use Food Diary"));
    }

    [Scenario]
    public Task The_server_does_not_fetch_cimd_client_metadata_document_from_special_use_address()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_behind_real_address_filter(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with(
                "client ID metadata document URL does not resolve to a public address"));
    }

    [Scenario]
    public Task The_cimd_client_is_refused_when_its_metadata_document_is_not_found()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_is_not_found(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with("client ID metadata document did not respond with 200 OK"));
    }

    [Scenario]
    public Task The_cimd_client_is_refused_when_its_metadata_document_redirects()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_redirects_to_another_url(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with(
                "client ID metadata document responded with a redirect, which is not followed"));
    }

    [Scenario]
    public Task The_cimd_client_is_refused_when_its_metadata_document_responds_after_5_seconds()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_responds_after(6),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with("client ID metadata document did not respond within 5 seconds"));
    }

    [Scenario]
    public Task The_cimd_client_is_refused_when_its_metadata_document_is_larger_than_5_kb()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_larger_than_5_kb(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with("client ID metadata document is larger than 5 KB"));
    }

    [Scenario]
    public Task The_cimd_client_is_refused_when_its_metadata_document_is_not_json()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_is_not_json(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with("client ID metadata document is not a JSON object"));
    }

    [Scenario]
    public Task The_cimd_client_is_refused_when_its_metadata_document_cannot_be_fetched()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_served_with_untrusted_certificate(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with("client ID metadata document could not be fetched"));
    }

    [Scenario]
    [InlineData("client_id")]
    [InlineData("client_name")]
    [InlineData("redirect_uris")]
    public Task The_cimd_client_is_refused_when_its_metadata_document_misses_required_field(string field)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_without(field),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with(
                "client ID metadata document must contain client_id, client_name and redirect_uris"));
    }

    [Scenario]
    [InlineData("https://localhost:4747/other-oauth-client.json")]
    [InlineData("https://LOCALHOST:4747/oauth-client.json")]
    public Task The_cimd_client_is_refused_when_its_metadata_document_names_another_client_id(string clientId)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_with("client_id", clientId),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with(
                "client ID metadata document's client_id does not match the client_id URL"));
    }

    [Scenario]
    [InlineData("private_key_jwt")]
    [InlineData("client_secret_post")]
    public Task The_cimd_client_is_refused_when_it_does_not_use_none_token_endpoint_auth_method(string method)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_with("token_endpoint_auth_method", method),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with(
                "client ID metadata document's token_endpoint_auth_method must be none"));
    }

    [Scenario]
    [InlineData("http://127.0.0.1:1456/other-callback")]
    [InlineData("http://127.0.0.1:1456/callback/")]
    [InlineData("")]
    [InlineData(null)]
    public Task The_cimd_client_is_refused_when_redirect_uri_is_not_listed_in_its_metadata_document(string? redirectUri)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization_with("redirect_uri", redirectUri),
            c => c.Then_authorization_is_refused_with(
                "redirect_uri is not listed in the client ID metadata document"));
    }

    [Scenario]
    [InlineData("myapp://callback")]
    [InlineData("http://client.example.com/callback")]
    [InlineData("http://localhost.client.example.com/callback")]
    [InlineData("http://127.0.0.2:1456/callback")]
    public Task The_cimd_client_is_refused_when_redirect_uri_is_neither_https_nor_loopback_http(string redirectUri)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_with_redirect_uri(redirectUri),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization_with("redirect_uri", redirectUri),
            c => c.Then_authorization_is_refused_with(
                "redirect_uri must use https, or http on localhost, 127.0.0.1 or [::1]"));
    }

    [Scenario]
    [InlineData("response_type", "token", "response_type must be code")]
    [InlineData("code_challenge_method", "plain", "PKCE is required with code_challenge_method S256")]
    [InlineData("code_challenge", null, "PKCE is required with code_challenge_method S256")]
    [InlineData("scope", "food:write", "The only supported scope is food:read")]
    [InlineData("resource", "https://other.example.com/mcp", "The only supported resource is http://localhost/mcp")]
    public Task The_cimd_client_is_refused_without_redirect_when_request_is_invalid(
        string parameter,
        string? value,
        string reason)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization_with(parameter, value),
            c => c.Then_authorization_is_refused_with(reason));
    }

    [Scenario]
    public Task The_cimd_client_is_refused_when_its_client_id_is_not_https()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document(),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization_with("client_id", "http://localhost:4747/oauth-client.json"),
            c => c.Then_authorization_is_refused_with(
                "client_id is neither registered nor a valid https client ID metadata document URL"));
    }

    [Scenario]
    public Task The_server_starts_with_mcp_enabled_and_no_configured_clients()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_no_configured_mcp_clients(),
            c => c.When_client_requests_authorization_server_metadata(),
            c => c.Then_authorization_server_metadata_is_built_from_base_url());
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
