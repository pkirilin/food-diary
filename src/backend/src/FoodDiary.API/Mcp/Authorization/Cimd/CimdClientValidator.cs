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
        var redirectUris = StringArrayProperty(document, "redirect_uris")!;
        var redirectUri = request.RedirectUri!;

        var client = new McpClientDisplay(
            Name: StringProperty(document, "client_name")!,
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
        document.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.Array
            ? value.EnumerateArray().Select(item => item.GetString()!).ToArray()
            : null;
}
