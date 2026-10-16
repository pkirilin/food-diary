namespace FoodDiary.API.Mcp.Authorization;

public abstract record McpClientKind
{
    public sealed record Registered(McpClientRegistration Registration) : McpClientKind;

    public sealed record Cimd : McpClientKind;

    public sealed record Unknown : McpClientKind;

    public static McpClientKind Of(string? clientId, McpOptions options)
    {
        if (options.Clients.FirstOrDefault(client => client.ClientId == clientId) is { } registration)
        {
            return new Registered(registration);
        }

        return IsMetadataDocumentUrl(clientId) ? new Cimd() : new Unknown();
    }

    // Checked on the raw string because System.Uri normalises dot segments, backslashes and empty paths away
    private static bool IsMetadataDocumentUrl(string? clientId)
    {
        const string httpsPrefix = "https://";

        if (clientId is null
            || !clientId.StartsWith(httpsPrefix, StringComparison.OrdinalIgnoreCase)
            || clientId.Contains('#')
            || clientId.Contains('\\')
            || !Uri.TryCreate(clientId, UriKind.Absolute, out _))
        {
            return false;
        }

        var afterScheme = clientId[httpsPrefix.Length..];
        var authorityEnd = afterScheme.IndexOfAny(['/', '?']);

        if (authorityEnd < 0 || afterScheme[authorityEnd] != '/' || afterScheme[..authorityEnd].Contains('@'))
        {
            return false;
        }

        var path = afterScheme[authorityEnd..].Split('?')[0];

        return path.Split('/').Select(Uri.UnescapeDataString).All(segment => segment is not ("." or ".."));
    }
}
