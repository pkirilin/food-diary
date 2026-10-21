using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using JetBrains.Annotations;

namespace FoodDiary.ComponentTests.Scenarios.Mcp;

[UsedImplicitly]
public class McpConsentContext(FoodDiaryWebApplicationFactory factory, ExternalServicesFixture externalServices)
    : McpContext(factory, externalServices)
{
    private const string AnotherAllowedUserEmail = "another.user@gmail.com";

    private readonly List<HttpResponseMessage> _consentPageResponses = [];

    public Task Given_cimd_client_metadata_document_with_logo_and_redirect_uris(string logoUri, params string[] redirectUris)
    {
        var document = CimdDocument();
        document["logo_uri"] = logoUri;
        document["redirect_uris"] = redirectUris;

        return ServeCimdDocument(document);
    }

    public async Task When_owner_opens_consent_page()
    {
        ConsentRequest ??= ConsentRequestFromRedirect();

        _consentPageResponses.Add(await OAuthClient.GetAsync(
            $"/authorize/consent?consentRequest={Uri.EscapeDataString(ConsentRequest)}"));
    }

    public Task When_owner_denies_consent()
    {
        return DecideOnConsent(approved: false);
    }

    public Task When_owner_approves_consent_with_null_consent_request()
    {
        return RecordConsentDecision(OAuthClient.PostAsJsonAsync("/authorize/consent", new
        {
            consentRequest = (string?)null,
            approved = true
        }));
    }

    public Task When_owner_approves_consent_with_form_post()
    {
        ConsentRequest ??= ConsentRequestFromRedirect();

        return RecordConsentDecision(OAuthClient.PostAsync("/authorize/consent", new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["consentRequest"] = ConsentRequest,
                ["approved"] = "true"
            })));
    }

    public Task When_consent_request_is_tampered_with()
    {
        var consentRequest = ConsentRequestFromRedirect();
        var middle = consentRequest.Length / 2;
        var replacement = consentRequest[middle] == 'A' ? 'B' : 'A';

        ConsentRequest = string.Concat(consentRequest[..middle], replacement, consentRequest[(middle + 1)..]);

        return Task.CompletedTask;
    }

    public Task When_another_allowed_user_is_signed_in()
    {
        return SignInOnNewHost(AnotherAllowedUserEmail);
    }

    public Task When_owner_signs_in_again()
    {
        return SignInOnNewHost(AllowedUserEmail);
    }

    public Task When_consent_api_is_called_with(string method)
    {
        ConsentRequest = "unknown-consent-request";

        return method == "GET" ? When_owner_opens_consent_page() : When_owner_approves_consent();
    }

    public Task When_minutes_pass(int minutes)
    {
        Clock.Advance(TimeSpan.FromMinutes(minutes));
        return Task.CompletedTask;
    }

    public async Task Then_consent_sends_cimd_client_back_with_code()
    {
        var redirectParameters = await LastConsentDecisionRedirectParameters();

        redirectParameters.Keys.Should().BeEquivalentTo("code", "state", "iss");
        redirectParameters["code"].ToString().Should().NotBeEmpty();
        redirectParameters["state"].ToString().Should().Be(State);
        redirectParameters["iss"].ToString().Should().Be(McpOptions.BaseUrl);
    }

    public async Task Then_consent_sends_cimd_client_back_with_error(string error)
    {
        var redirectParameters = await LastConsentDecisionRedirectParameters();

        redirectParameters.Keys.Should().BeEquivalentTo("error", "state", "iss");
        redirectParameters["error"].ToString().Should().Be(error);
        redirectParameters["state"].ToString().Should().Be(State);
        redirectParameters["iss"].ToString().Should().Be(McpOptions.BaseUrl);
    }

    public async Task Then_consent_request_is_refused_as_expired()
    {
        foreach (var response in _consentPageResponses.Concat(ConsentDecisionResponses))
        {
            await ShouldBeExpiredConsentRequest(response);
        }
    }

    public async Task Then_consent_request_is_refused_as_expired_after_first_decision()
    {
        ConsentDecisionResponses[0].StatusCode.Should().Be(HttpStatusCode.OK);

        foreach (var response in _consentPageResponses.Concat(ConsentDecisionResponses.Skip(1)))
        {
            await ShouldBeExpiredConsentRequest(response);
        }
    }

    private static async Task ShouldBeExpiredConsentRequest(HttpResponseMessage response)
    {
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");

        using var problem = await ReadJson(response);
        problem.RootElement.GetProperty("title").GetString().Should().Be("Consent request expired");
        problem.RootElement.GetProperty("detail").GetString()
            .Should().Be("This request has expired; start again from your MCP Client.");
    }

    public Task Then_consent_api_asks_owner_to_sign_in_with_google()
    {
        var response = _consentPageResponses.Concat(ConsentDecisionResponses).Single();
        response.StatusCode.Should().Be(HttpStatusCode.Redirect);
        response.Headers.Location!.Host.Should().Be("accounts.google.com");
        return Task.CompletedTask;
    }

    public Task Then_consent_api_is_forbidden()
    {
        _consentPageResponses.Concat(ConsentDecisionResponses).Single()
            .StatusCode.Should().Be(HttpStatusCode.Forbidden);
        return Task.CompletedTask;
    }

    public Task Then_consent_decision_is_refused_as_unsupported_media_type()
    {
        ConsentDecisionResponses.Single().StatusCode.Should().Be(HttpStatusCode.UnsupportedMediaType);
        return Task.CompletedTask;
    }

    public async Task Then_consent_page_shows_client(string? logoUri, string redirectUriHost, bool isLocalhostOnly)
    {
        var response = _consentPageResponses.Single();
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.Should().Be("application/json");

        var consent = JsonNode.Parse(await response.Content.ReadAsStringAsync());
        var expectedConsent = new JsonObject
        {
            ["clientName"] = CimdClientName,
            ["logoUri"] = logoUri,
            ["clientIdHost"] = "localhost",
            ["redirectUriHost"] = redirectUriHost,
            ["isLocalhostOnly"] = isLocalhostOnly
        };

        JsonNode.DeepEquals(consent, expectedConsent)
            .Should().BeTrue("consent must be {0}, but was {1}", expectedConsent.ToJsonString(), consent?.ToJsonString());
    }
}
