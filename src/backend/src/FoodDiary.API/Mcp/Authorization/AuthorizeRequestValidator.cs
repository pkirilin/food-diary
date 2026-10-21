using System.Diagnostics;
using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp.Authorization;

public abstract record AuthorizeRequestValidation
{
    public sealed record Accepted(
        string ClientId,
        string RedirectUri,
        string CodeChallenge,
        string Scope,
        string Resource,
        string? State) : AuthorizeRequestValidation;

    /// <summary>
    /// The client or its redirect_uri cannot be trusted, so the error must not be sent to that redirect_uri
    /// (RFC 6749 §4.1.2.1).
    /// </summary>
    public sealed record Refused(string Reason) : AuthorizeRequestValidation;

    public sealed record ErrorRedirect(
        string RedirectUri,
        string Error,
        string Description,
        string? State) : AuthorizeRequestValidation;

    public sealed record CimdClient : AuthorizeRequestValidation;
}

public sealed class AuthorizeRequestValidator(IOptions<McpOptions> options)
{
    public AuthorizeRequestValidation Validate(AuthorizeRequest request) =>
        McpClientKind.Of(request.ClientId, options.Value) switch
        {
            McpClientKind.Registered { Registration: var client } when request.RedirectUri != client.RedirectUri =>
                new AuthorizeRequestValidation.Refused("redirect_uri is not the one registered for this client_id"),

            McpClientKind.Registered { Registration: var client } =>
                ValidateProtocolParameters(request, client.ClientId!, client.RedirectUri!),

            McpClientKind.Cimd => new AuthorizeRequestValidation.CimdClient(),

            McpClientKind.Unknown => new AuthorizeRequestValidation.Refused(
                "client_id is neither registered nor a valid https client ID metadata document URL"),

            _ => throw new UnreachableException()
        };

    internal AuthorizeRequestValidation ValidateProtocolParameters(
        AuthorizeRequest request,
        string clientId,
        string redirectUri)
    {
        AuthorizeRequestValidation.ErrorRedirect Error(string error, string description) =>
            new(redirectUri, error, description, request.State);

        if (request.ResponseType != "code")
        {
            return Error("unsupported_response_type", "response_type must be code");
        }

        if (string.IsNullOrEmpty(request.CodeChallenge) || request.CodeChallengeMethod != "S256")
        {
            return Error("invalid_request", "PKCE is required with code_challenge_method S256");
        }

        var requestedScopes = request.Scope?.Split(' ', StringSplitOptions.RemoveEmptyEntries) ?? [];

        if (requestedScopes.Any(scope => scope != McpScopes.FoodRead))
        {
            return Error("invalid_scope", $"The only supported scope is {McpScopes.FoodRead}");
        }

        var mcpResource = options.Value.McpResource;

        if (request.Resource is not null && request.Resource != mcpResource)
        {
            return Error("invalid_target", $"The only supported resource is {mcpResource}");
        }

        return new AuthorizeRequestValidation.Accepted(
            clientId,
            redirectUri,
            request.CodeChallenge,
            McpScopes.FoodRead,
            mcpResource,
            request.State);
    }
}
