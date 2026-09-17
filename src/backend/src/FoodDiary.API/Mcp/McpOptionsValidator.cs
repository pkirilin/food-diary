using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp;

internal sealed class McpOptionsValidator : IValidateOptions<McpOptions>
{
    public ValidateOptionsResult Validate(string? name, McpOptions options)
    {
        if (!options.Enabled)
        {
            return ValidateOptionsResult.Success;
        }

        var failures = new List<string>();

        if (FindUrlFailure("Mcp:BaseUrl", options.BaseUrl) is { } baseUrlFailure)
        {
            failures.Add(baseUrlFailure);
        }
        else if (new Uri(options.BaseUrl!).AbsolutePath != "/")
        {
            failures.Add("Mcp:BaseUrl must be an origin without a path");
        }

        if (options.Clients.Count == 0)
        {
            failures.Add("Mcp:Clients requires at least one client");
        }

        var firstIndexByClientId = new Dictionary<string, int>(StringComparer.Ordinal);

        for (var index = 0; index < options.Clients.Count; index++)
        {
            var client = options.Clients[index];
            var key = $"Mcp:Clients:{index}";

            if (string.IsNullOrWhiteSpace(client.ClientId))
            {
                failures.Add($"{key}:ClientId is required");
            }
            else if (!firstIndexByClientId.TryAdd(client.ClientId, index))
            {
                failures.Add($"{key}:ClientId duplicates Mcp:Clients:{firstIndexByClientId[client.ClientId]}:ClientId");
            }

            if (string.IsNullOrWhiteSpace(client.ClientSecret))
            {
                failures.Add($"{key}:ClientSecret is required");
            }

            if (FindUrlFailure($"{key}:RedirectUri", client.RedirectUri) is { } redirectUriFailure)
            {
                failures.Add(redirectUriFailure);
            }
        }

        return failures.Count > 0 ? ValidateOptionsResult.Fail(failures) : ValidateOptionsResult.Success;
    }

    private static string? FindUrlFailure(string key, string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return $"{key} is required";
        }

        if (url != url.Trim())
        {
            return $"{key} must not have leading or trailing whitespace";
        }

        // On Unix, "/mcp" parses as an absolute file:///mcp URI
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) || uri.IsFile)
        {
            return $"{key} must be an absolute URL";
        }

        if (uri.Scheme != Uri.UriSchemeHttps && !(uri.Scheme == Uri.UriSchemeHttp && uri.Host == "localhost"))
        {
            return $"{key} must use https; http is allowed only for localhost";
        }

        if (uri.Query.Length > 0 || uri.Fragment.Length > 0)
        {
            return $"{key} must not have a query or fragment";
        }

        if (url.EndsWith('/'))
        {
            return $"{key} must not end with a slash";
        }

        return null;
    }
}
