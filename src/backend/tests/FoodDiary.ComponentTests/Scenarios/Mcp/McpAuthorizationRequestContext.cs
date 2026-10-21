using System.Net;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using JetBrains.Annotations;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

[UsedImplicitly]
public class McpAuthorizationRequestContext(
    FoodDiaryWebApplicationFactory factory,
    ExternalServicesFixture externalServices) : McpContext(factory, externalServices)
{
    public Task Given_cimd_client_metadata_document_with_redirect_uri(string redirectUri)
    {
        return Given_cimd_client_metadata_document_with("redirect_uris", new[] { redirectUri });
    }

    public Task Then_authorization_error_response_carries_state_and_issuer(string error)
    {
        AuthorizationResponseParameter("error").Should().Be(error);
        AuthorizationResponseParameter("code").Should().BeEmpty();
        AuthorizationResponseParameter("state").Should().Be(State);
        AuthorizationResponseParameter("iss").Should().Be(McpOptions.BaseUrl);
        return Task.CompletedTask;
    }

    public Task Then_owner_is_asked_to_sign_in_with_google()
    {
        AuthorizeResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);
        AuthorizeResponse.Headers.Location!.Host.Should().Be("accounts.google.com");
        return Task.CompletedTask;
    }
}
