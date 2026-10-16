using System.Security.Claims;
using FoodDiary.Contracts.Mcp;
using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp.Authorization.Consent;

internal sealed class McpConsentHandler(
    McpConsentRequestService consentRequestService,
    McpTokenService tokenService,
    IOptions<McpOptions> options)
{
    public IResult Get(string consentRequest, ClaimsPrincipal owner)
    {
        if (consentRequestService.Read(consentRequest, EmailOf(owner)) is not { Client: var client })
        {
            return ConsentRequestExpired();
        }

        return Results.Ok(new GetMcpConsentResponse
        {
            ClientName = client.Name,
            LogoUri = client.LogoUri,
            ClientIdHost = client.ClientIdHost,
            RedirectUriHost = client.RedirectUriHost,
            IsLocalhostOnly = client.IsLocalhostOnly
        });
    }

    public IResult Submit(SubmitMcpConsentRequest submission, ClaimsPrincipal owner)
    {
        if (consentRequestService.Redeem(submission.ConsentRequest, EmailOf(owner)) is not { } consentRequest)
        {
            return ConsentRequestExpired();
        }

        var request = consentRequest.Request;

        var redirectUrl = submission.Approved
            ? RedirectUrl(request, ("code", IssueAuthorizationCode(request, consentRequest.Email)))
            : RedirectUrl(request, ("error", "access_denied"));

        return Results.Ok(new SubmitMcpConsentResponse { RedirectUrl = redirectUrl });
    }

    private string IssueAuthorizationCode(AuthorizeRequestValidation.Accepted request, string email)
    {
        var access = new AccessGrant(request.ClientId, email, request.Scope, request.Resource);
        return tokenService.IssueAuthorizationCode(new AuthorizationCodeGrant(access, request.RedirectUri, request.CodeChallenge));
    }

    private string RedirectUrl(AuthorizeRequestValidation.Accepted request, (string Name, string Value) parameter) =>
        AuthorizationResponse.RedirectUrl(request.RedirectUri, request.State, options.Value.BaseUrl!, parameter);

    private static string EmailOf(ClaimsPrincipal owner) => owner.FindFirstValue(Constants.ClaimTypes.Email)!;

    private static IResult ConsentRequestExpired() =>
        Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: "Consent request expired",
            detail: "This request has expired; start again from your MCP Client.");
}
