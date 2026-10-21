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
        var id = Guid.CreateVersion7().ToString("N");
        var payload = new ConsentRequestPayload(id, consentRequest, timeProvider.GetUtcNow() + Lifetime);

        lock (_decisionLock)
        {
            memoryCache.Set(UndecidedKey(id), true, Lifetime);
        }

        return _protector.Protect(JsonSerializer.Serialize(payload));
    }

    public McpConsentRequest? Read(string? consentRequest, string email)
    {
        var payload = OwnersUnexpiredPayload(consentRequest, email);

        if (payload is null)
        {
            return null;
        }

        lock (_decisionLock)
        {
            return memoryCache.TryGetValue(UndecidedKey(payload.Id), out _) ? payload.ConsentRequest : null;
        }
    }

    public McpConsentRequest? Redeem(string? consentRequest, string email)
    {
        var payload = OwnersUnexpiredPayload(consentRequest, email);

        if (payload is null)
        {
            return null;
        }

        lock (_decisionLock)
        {
            if (!memoryCache.TryGetValue(UndecidedKey(payload.Id), out _))
            {
                return null;
            }

            memoryCache.Remove(UndecidedKey(payload.Id));
        }

        return payload.ConsentRequest;
    }

    private static string UndecidedKey(string id) => $"mcp:undecided-consent-request:{id}";

    private ConsentRequestPayload? OwnersUnexpiredPayload(string? consentRequest, string email)
    {
        var payload = Unprotect(consentRequest);

        return payload is not null
               && payload.ConsentRequest.Email == email
               && timeProvider.GetUtcNow() < payload.ExpiresAt
            ? payload
            : null;
    }

    private ConsentRequestPayload? Unprotect(string? consentRequest)
    {
        if (consentRequest is null)
        {
            return null;
        }

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
