using System.Security.Claims;
using FoodDiary.Contracts.Mcp;

namespace FoodDiary.API.Mcp.Authorization.Consent;

internal sealed class McpConsentHandler(
    McpConsentRequestService consentRequestService,
    AuthorizationResponse authorizationResponse)
{
    public IResult Get(string consentRequest, ClaimsPrincipal owner)
    {
        if (consentRequestService.Read(consentRequest, EmailOf(owner)) is not { Client: var client })
        {
            return InvalidConsentRequest();
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
            return InvalidConsentRequest();
        }

        var request = consentRequest.Request;

        var redirectUrl = submission.Approved
            ? authorizationResponse.RedirectUrlWithCode(request, consentRequest.Email)
            : authorizationResponse.RedirectUrlWithError(request.RedirectUri, request.State, "access_denied");

        return Results.Ok(new SubmitMcpConsentResponse { RedirectUrl = redirectUrl });
    }

    private static string EmailOf(ClaimsPrincipal owner) => owner.FindFirstValue(Constants.ClaimTypes.Email)!;

    private static IResult InvalidConsentRequest() =>
        Results.Problem(
            statusCode: StatusCodes.Status400BadRequest,
            title: "Consent request expired",
            detail: "This request has expired; start again from your MCP Client.");
}
