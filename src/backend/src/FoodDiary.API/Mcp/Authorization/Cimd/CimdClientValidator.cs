using System.Diagnostics;
using System.Text.Json;
using FoodDiary.API.Mcp.Authorization.Consent;

namespace FoodDiary.API.Mcp.Authorization.Cimd;

public abstract record CimdClientValidation
{
    public sealed record Accepted(AuthorizeRequestValidation.Accepted Request, McpClientDisplay Client)
        : CimdClientValidation;

    public sealed record Refused(string Reason) : CimdClientValidation;
}

internal sealed class CimdClientValidator(CimdMetadataDocumentFetcher fetcher, AuthorizeRequestValidator requestValidator)
{
    public async Task<CimdClientValidation> Validate(AuthorizeRequest request, CancellationToken cancellationToken)
    {
        var clientId = request.ClientId!;
        var fetch = await fetcher.Fetch(clientId, cancellationToken);

        if (fetch is CimdMetadataDocumentFetch.Failed failed)
        {
            return new CimdClientValidation.Refused(failed.Reason);
        }

        var document = ((CimdMetadataDocumentFetch.Fetched)fetch).Document;
        var documentClientId = StringProperty(document, "client_id");
        var clientName = StringProperty(document, "client_name");
        var redirectUris = StringArrayProperty(document, "redirect_uris");

        if (documentClientId is null || string.IsNullOrWhiteSpace(clientName) || redirectUris is null)
        {
            return new CimdClientValidation.Refused(
                "client ID metadata document must contain client_id, client_name and redirect_uris");
        }

        if (!string.Equals(documentClientId, clientId, StringComparison.Ordinal))
        {
            return new CimdClientValidation.Refused(
                "client ID metadata document's client_id does not match the client_id URL");
        }

        if (document.TryGetProperty("token_endpoint_auth_method", out _)
            && StringProperty(document, "token_endpoint_auth_method") != "none")
        {
            return new CimdClientValidation.Refused(
                "client ID metadata document's token_endpoint_auth_method must be none");
        }

        var redirectUri = request.RedirectUri;

        if (redirectUri is null || !redirectUris.Contains(redirectUri, StringComparer.Ordinal))
        {
            return new CimdClientValidation.Refused("redirect_uri is not listed in the client ID metadata document");
        }

        if (!IsAcceptedRedirectUri(redirectUri))
        {
            return new CimdClientValidation.Refused(
                "redirect_uri must use https, or http on localhost, 127.0.0.1 or [::1]");
        }

        var client = new McpClientDisplay(
            Name: clientName,
            LogoUri: HttpsUriOrNull(StringProperty(document, "logo_uri")),
            ClientIdHost: new Uri(clientId).IdnHost,
            RedirectUriHost: new Uri(redirectUri).IdnHost,
            IsLocalhostOnly: redirectUris.All(IsLoopbackUri));

        return requestValidator.ValidateProtocolParameters(request, clientId, redirectUri) switch
        {
            AuthorizeRequestValidation.Accepted accepted => new CimdClientValidation.Accepted(accepted, client),

            // A CIMD document is self-asserted, so its redirect URIs are untrusted until the owner approves
            AuthorizeRequestValidation.ErrorRedirect error => new CimdClientValidation.Refused(error.Description),

            _ => throw new UnreachableException()
        };
    }

    private static bool IsAcceptedRedirectUri(string redirectUri) =>
        Uri.TryCreate(redirectUri, UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttps
            || (uri.Scheme == Uri.UriSchemeHttp && uri.Host is "localhost" or "127.0.0.1" or "[::1]"));

    private static bool IsLoopbackUri(string uri) =>
        Uri.TryCreate(uri, UriKind.Absolute, out var parsed) && parsed.IsLoopback;

    private static string? HttpsUriOrNull(string? uri) =>
        Uri.TryCreate(uri, UriKind.Absolute, out var parsed) && parsed.Scheme == Uri.UriSchemeHttps ? uri : null;

    private static string? StringProperty(JsonElement document, string name) =>
        document.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;

    private static string[]? StringArrayProperty(JsonElement document, string name) =>
        document.TryGetProperty(name, out var value)
        && value.ValueKind == JsonValueKind.Array
        && value.EnumerateArray().All(item => item.ValueKind == JsonValueKind.String)
            ? value.EnumerateArray().Select(item => item.GetString()!).ToArray()
            : null;
}
