using System.Text.Json;
using System.Text.Json.Serialization;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp.Authorization;

public static class AuthorizationServerEndpoints
{
    internal static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    [PublicAPI]
    private sealed record AuthorizationServerMetadata(
        string Issuer,
        string AuthorizationEndpoint,
        string TokenEndpoint,
        string[] ResponseTypesSupported,
        string[] GrantTypesSupported,
        string[] CodeChallengeMethodsSupported,
        string[] TokenEndpointAuthMethodsSupported,
        string[] ScopesSupported,
        bool AuthorizationResponseIssParameterSupported);

    public static void MapMcpAuthorizationServer(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/.well-known/oauth-authorization-server", GetMetadata);
        endpoints.MapGet("/authorize", (
            [AsParameters] AuthorizeRequest request,
            HttpContext context,
            [FromServices] AuthorizeRequestHandler handler) => handler.Handle(request, context));

        endpoints.MapPost("/token", (
            HttpContext context,
            [FromServices] TokenRequestHandler handler) => handler.Handle(context));
    }

    private static IResult GetMetadata(IOptions<McpOptions> options)
    {
        var baseUrl = options.Value.BaseUrl!;

        var metadata = new AuthorizationServerMetadata(
            Issuer: baseUrl,
            AuthorizationEndpoint: $"{baseUrl}/authorize",
            TokenEndpoint: $"{baseUrl}/token",
            ResponseTypesSupported: ["code"],
            GrantTypesSupported: ["authorization_code", "refresh_token"],
            CodeChallengeMethodsSupported: ["S256"],
            TokenEndpointAuthMethodsSupported: ["client_secret_post"],
            ScopesSupported: [McpScopes.FoodRead],
            AuthorizationResponseIssParameterSupported: true);

        return Results.Json(metadata, SerializerOptions);
    }
}
