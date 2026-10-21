using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

public class McpCimdFetchingTests(InfrastructureFixture infrastructure) : BaseTest<McpCimdFetchingContext>(infrastructure)
{
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
    public Task The_cimd_client_is_refused_when_its_metadata_document_declares_unknown_charset()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_cimd_client_metadata_document_served_as("application/json; charset=bogus"),
            c => c.Given_authenticated_user(),
            c => c.When_cimd_client_requests_authorization(),
            c => c.Then_authorization_is_refused_with("client ID metadata document declares an unsupported charset"));
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
}
