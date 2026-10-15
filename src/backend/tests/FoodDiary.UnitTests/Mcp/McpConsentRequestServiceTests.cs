using FoodDiary.API.Mcp.Authorization;
using FoodDiary.API.Mcp.Authorization.Consent;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Caching.Memory;

namespace FoodDiary.UnitTests.Mcp;

public class McpConsentRequestServiceTests
{
    private const string OwnerEmail = "owner@example.com";

    private readonly AdjustableTimeProvider _timeProvider = new(new DateTimeOffset(2026, 10, 15, 12, 0, 0, TimeSpan.Zero));
    private readonly McpConsentRequestService _consentRequests;

    public McpConsentRequestServiceTests()
    {
        _consentRequests = new McpConsentRequestService(
            new EphemeralDataProtectionProvider(),
            new MemoryCache(new MemoryCacheOptions()),
            _timeProvider);
    }

    private static McpConsentRequest ConsentRequest() => new(
        new AuthorizeRequestValidation.Accepted(
            ClientId: "https://chatboxai.app/.well-known/oauth-client",
            RedirectUri: "http://127.0.0.1:1456/callback",
            CodeChallenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            Scope: "food:read",
            Resource: "https://diary.example.com/mcp",
            State: "af0ifjsldkj"),
        new McpClientDisplay(
            Name: "Chatbox",
            LogoUri: null,
            ClientIdHost: "chatboxai.app",
            RedirectUriHost: "127.0.0.1",
            IsLocalhostOnly: true),
        OwnerEmail);

    [Fact]
    public void ConsentRequest_BeforeExpiry_IsReadableByItsOwner()
    {
        var consentRequest = ConsentRequest();
        var issued = _consentRequests.Issue(consentRequest);

        _timeProvider.Advance(TimeSpan.FromMinutes(9));

        _consentRequests.Read(issued, OwnerEmail).Should().BeEquivalentTo(consentRequest);
    }

    [Fact]
    public void ConsentRequest_AtExpiry_IsInvalid()
    {
        var issued = _consentRequests.Issue(ConsentRequest());

        _timeProvider.Advance(TimeSpan.FromMinutes(10));

        _consentRequests.Read(issued, OwnerEmail).Should().BeNull();
        _consentRequests.Redeem(issued, OwnerEmail).Should().BeNull();
    }

    [Fact]
    public void ConsentRequest_PresentedByAnotherUser_IsInvalid()
    {
        var issued = _consentRequests.Issue(ConsentRequest());

        _consentRequests.Read(issued, "someone.else@example.com").Should().BeNull();
        _consentRequests.Redeem(issued, "someone.else@example.com").Should().BeNull();
    }

    [Fact]
    public void ConsentRequest_PresentedByAnotherUser_StaysRedeemableByItsOwner()
    {
        var consentRequest = ConsentRequest();
        var issued = _consentRequests.Issue(consentRequest);

        _consentRequests.Redeem(issued, "someone.else@example.com");

        _consentRequests.Redeem(issued, OwnerEmail).Should().BeEquivalentTo(consentRequest);
    }

    [Fact]
    public void ConsentRequest_AfterRedemption_IsInvalid()
    {
        var consentRequest = ConsentRequest();
        var issued = _consentRequests.Issue(consentRequest);

        _consentRequests.Redeem(issued, OwnerEmail).Should().BeEquivalentTo(consentRequest);

        _consentRequests.Redeem(issued, OwnerEmail).Should().BeNull();
        _consentRequests.Read(issued, OwnerEmail).Should().BeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-a-consent-request")]
    public void MalformedConsentRequest_IsInvalid(string consentRequest)
    {
        _consentRequests.Read(consentRequest, OwnerEmail).Should().BeNull();
        _consentRequests.Redeem(consentRequest, OwnerEmail).Should().BeNull();
    }

    [Fact]
    public void ConsentRequest_IssuedBySeparateProtector_IsInvalid()
    {
        var otherService = new McpConsentRequestService(
            new EphemeralDataProtectionProvider(),
            new MemoryCache(new MemoryCacheOptions()),
            _timeProvider);

        var issuedElsewhere = otherService.Issue(ConsentRequest());

        _consentRequests.Read(issuedElsewhere, OwnerEmail).Should().BeNull();
    }

    private sealed class AdjustableTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        private DateTimeOffset _utcNow = utcNow;

        public void Advance(TimeSpan by) => _utcNow += by;

        public override DateTimeOffset GetUtcNow() => _utcNow;
    }
}
