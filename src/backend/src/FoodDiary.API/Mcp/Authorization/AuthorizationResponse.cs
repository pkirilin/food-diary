using Microsoft.AspNetCore.WebUtilities;

namespace FoodDiary.API.Mcp.Authorization;

internal static class AuthorizationResponse
{
    public static string RedirectUrl(
        string redirectUri,
        string? state,
        string issuer,
        params (string Name, string Value)[] parameters)
    {
        var query = parameters
            .Select(parameter => KeyValuePair.Create(parameter.Name, (string?)parameter.Value))
            .Append(KeyValuePair.Create("state", state))
            .Append(KeyValuePair.Create("iss", (string?)issuer));

        return QueryHelpers.AddQueryString(redirectUri, query);
    }
}
