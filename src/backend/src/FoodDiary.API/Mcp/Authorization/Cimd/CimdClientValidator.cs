using System.Text.Json;
using FoodDiary.API.Mcp.Authorization.Consent;
using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp.Authorization.Cimd;

public abstract record CimdClientValidation
{
    public sealed record Accepted(AuthorizeRequestValidation.Accepted Request, McpClientDisplay Client)
        : CimdClientValidation;

    public sealed record Refused(string Reason) : CimdClientValidation;
}

internal sealed class CimdClientValidator(CimdMetadataDocumentFetcher fetcher, IOptions<McpOptions> options)
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

        var redirectUri = request.RedirectUri!;

        var client = new McpClientDisplay(
            Name: clientName,
            LogoUri: StringProperty(document, "logo_uri"),
            ClientIdHost: new Uri(clientId).IdnHost,
            RedirectUriHost: new Uri(redirectUri).IdnHost,
            IsLocalhostOnly: redirectUris.All(uri => new Uri(uri).IsLoopback));

        var accepted = new AuthorizeRequestValidation.Accepted(
            clientId,
            redirectUri,
            request.CodeChallenge!,
            McpScopes.FoodRead,
            options.Value.McpResource,
            request.State);

        return new CimdClientValidation.Accepted(accepted, client);
    }

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
