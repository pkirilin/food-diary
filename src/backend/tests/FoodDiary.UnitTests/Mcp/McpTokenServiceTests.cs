using FoodDiary.API.Mcp;
using FoodDiary.API.Mcp.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace FoodDiary.UnitTests.Mcp;

public class McpTokenServiceTests
{
    private const string McpResource = "https://diary.example.com/mcp";

    private readonly AdjustableTimeProvider _timeProvider = new(new DateTimeOffset(2026, 9, 13, 12, 0, 0, TimeSpan.Zero));
    private readonly McpTokenService _tokenService;

    public McpTokenServiceTests()
    {
        _tokenService = new McpTokenService(
            new EphemeralDataProtectionProvider(),
            new MemoryCache(new MemoryCacheOptions()),
            _timeProvider,
            Options.Create(new McpOptions
            {
                Enabled = true,
                BaseUrl = "https://diary.example.com",
                AccessTokenLifetime = TimeSpan.FromHours(1)
            }));
    }

    private static AccessGrant Grant(string resource = McpResource) =>
        new("claude", "owner@example.com", "food:read", resource);

    [Fact]
    public void AccessToken_BeforeExpiry_IsValid()
    {
        var grant = Grant();
        var accessToken = _tokenService.IssueAccessToken(grant);

        _timeProvider.Advance(TimeSpan.FromMinutes(59));

        _tokenService.ValidateAccessToken(accessToken).Should().Be(grant);
    }

    [Fact]
    public void AccessToken_AtExpiry_IsInvalid()
    {
        var accessToken = _tokenService.IssueAccessToken(Grant());

        _timeProvider.Advance(TimeSpan.FromHours(1));

        _tokenService.ValidateAccessToken(accessToken).Should().BeNull();
    }

    [Fact]
    public void AccessToken_IssuedForAnotherResource_IsInvalid()
    {
        var accessToken = _tokenService.IssueAccessToken(Grant(resource: "https://other.example.com/mcp"));

        _tokenService.ValidateAccessToken(accessToken).Should().BeNull();
    }

    [Fact]
    public void RefreshToken_PresentedAsAccessToken_IsInvalid()
    {
        var tokens = _tokenService.IssueTokens(Grant());

        _tokenService.ValidateAccessToken(tokens.RefreshToken).Should().BeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("not-a-token")]
    public void MalformedAccessToken_IsInvalid(string accessToken)
    {
        _tokenService.ValidateAccessToken(accessToken).Should().BeNull();
    }

    private sealed class AdjustableTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        private DateTimeOffset _utcNow = utcNow;

        public void Advance(TimeSpan by) => _utcNow += by;

        public override DateTimeOffset GetUtcNow() => _utcNow;
    }
}
