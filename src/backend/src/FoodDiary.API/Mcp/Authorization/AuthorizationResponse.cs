using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp.Authorization;

internal sealed class AuthorizationResponse(McpTokenService tokenService, IOptions<McpOptions> options)
{
    public string RedirectUrlWithCode(AuthorizeRequestValidation.Accepted request, string email)
    {
        var access = new AccessGrant(request.ClientId, email, request.Scope, request.Resource);

        var code = tokenService.IssueAuthorizationCode(
            new AuthorizationCodeGrant(access, request.RedirectUri, request.CodeChallenge));

        return RedirectUrl(request.RedirectUri, request.State, ("code", code));
    }

    public string RedirectUrlWithError(string redirectUri, string? state, string error, string? description = null) =>
        RedirectUrl(redirectUri, state, ("error", error), ("error_description", description));

    private string RedirectUrl(string redirectUri, string? state, params (string Name, string? Value)[] parameters)
    {
        var query = parameters
            .Select(parameter => KeyValuePair.Create(parameter.Name, parameter.Value))
            .Append(KeyValuePair.Create("state", state))
            .Append(KeyValuePair.Create("iss", options.Value.BaseUrl));

        return QueryHelpers.AddQueryString(redirectUri, query);
    }
}
