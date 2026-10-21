using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

public class McpAuthorizationRequestTests(InfrastructureFixture infrastructure)
    : BaseTest<McpAuthorizationRequestContext>(infrastructure)
{
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
    public Task The_client_is_redirected_back_with_error_and_issuer_when_PKCE_is_not_S256()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.When_client_requests_authorization_with_code_challenge_method("plain"),
            c => c.Then_authorization_error_response_carries_state_and_issuer("invalid_request"));
    }
}
