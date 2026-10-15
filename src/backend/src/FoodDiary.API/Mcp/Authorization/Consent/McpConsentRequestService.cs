using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Caching.Memory;

namespace FoodDiary.API.Mcp.Authorization.Consent;

public sealed record McpClientDisplay(
    string Name,
    string? LogoUri,
    string ClientIdHost,
    string RedirectUriHost,
    bool IsLocalhostOnly);

public sealed record McpConsentRequest(
    AuthorizeRequestValidation.Accepted Request,
    McpClientDisplay Client,
    string Email);

public sealed class McpConsentRequestService(
    IDataProtectionProvider dataProtectionProvider,
    IMemoryCache memoryCache,
    TimeProvider timeProvider)
{
    private static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(10);

    private readonly IDataProtector _protector = dataProtectionProvider.CreateProtector("FoodDiary.Mcp.ConsentRequest");
    private readonly Lock _decisionLock = new();

    public string Issue(McpConsentRequest consentRequest)
    {
        var id = Guid.NewGuid().ToString("N");
        var payload = new ConsentRequestPayload(id, consentRequest, timeProvider.GetUtcNow() + Lifetime);

        lock (_decisionLock)
        {
            memoryCache.Set(UndecidedKey(id), true, Lifetime);
        }

        return _protector.Protect(JsonSerializer.Serialize(payload));
    }

    public McpConsentRequest? Read(string consentRequest, string email)
    {
        return Unprotect(consentRequest)?.ConsentRequest;
    }

    private static string UndecidedKey(string id) => $"mcp:undecided-consent-request:{id}";

    private ConsentRequestPayload? Unprotect(string consentRequest)
    {
        try
        {
            return JsonSerializer.Deserialize<ConsentRequestPayload>(_protector.Unprotect(consentRequest));
        }
        catch (Exception exception) when (exception is CryptographicException or FormatException)
        {
            return null;
        }
    }

    private sealed record ConsentRequestPayload(string Id, McpConsentRequest ConsentRequest, DateTimeOffset ExpiresAt);
}
