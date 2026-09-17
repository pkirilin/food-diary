using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Mcp.Authorization;

public sealed record AuthorizeRequest(
    [FromQuery(Name = "response_type")] string? ResponseType,
    [FromQuery(Name = "client_id")] string? ClientId,
    [FromQuery(Name = "redirect_uri")] string? RedirectUri,
    [FromQuery(Name = "code_challenge")] string? CodeChallenge,
    [FromQuery(Name = "code_challenge_method")] string? CodeChallengeMethod,
    [FromQuery(Name = "scope")] string? Scope,
    [FromQuery(Name = "resource")] string? Resource,
    [FromQuery(Name = "state")] string? State);
