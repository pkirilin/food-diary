using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

public class McpDiscoveryTests(InfrastructureFixture infrastructure) : BaseTest<McpDiscoveryContext>(infrastructure)
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
    [InlineData("GET", "/authorize/consent")]
    [InlineData("POST", "/authorize/consent")]
    [InlineData("POST", "/token")]
    public Task The_client_cannot_find_mcp_server_when_it_is_disabled(string method, string path)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_mcp_is_disabled(),
            c => c.When_client_requests(method, path),
            c => c.Then_response_is_not_found());
    }

    [Scenario]
    [InlineData("GET", "/api/v1/auth/status")]
    [InlineData("GET", "/.well-known/oauth-authorization-server")]
    [InlineData("GET", "/.well-known/unknown")]
    [InlineData("GET", "/authorize/consent")]
    [InlineData("POST", "/token")]
    public Task The_owner_cannot_be_shown_food_diary_inside_another_site(string method, string path)
    {
        return CtxRunner.RunScenarioAsync(
            c => c.When_client_requests(method, path),
            c => c.Then_response_cannot_be_embedded_in_another_site());
    }

    [Scenario]
    public Task The_server_starts_with_mcp_enabled_and_no_configured_clients()
    {
        return CtxRunner.RunScenarioAsync(
            c => c.Given_no_configured_mcp_clients(),
            c => c.When_client_requests_authorization_server_metadata(),
            c => c.Then_authorization_server_metadata_is_built_from_base_url());
    }
}
