using System.Diagnostics;
using System.Security.Claims;
using FoodDiary.API.Mcp.Authorization.Cimd;
using FoodDiary.API.Mcp.Authorization.Consent;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;

namespace FoodDiary.API.Mcp.Authorization;

internal sealed class AuthorizeRequestHandler(
    AuthorizeRequestValidator validator,
    CimdClientValidator cimdClientValidator,
    IAuthorizationService authorizationService,
    AuthorizationResponse authorizationResponse,
    McpConsentRequestService consentRequestService)
{
    private const string AccountNotAllowed = "This account is not allowed to use Food Diary";

    public async Task<IResult> Handle(AuthorizeRequest request, HttpContext context) =>
        validator.Validate(request) switch
        {
            AuthorizeRequestValidation.Refused refused => Refuse(refused.Reason),

            AuthorizeRequestValidation.ErrorRedirect error => Results.Redirect(
                authorizationResponse.RedirectUrlWithError(error.RedirectUri, error.State, error.Error, error.Description)),

            AuthorizeRequestValidation.Accepted accepted =>
                await AuthorizeSignedInUser(accepted, context),

            AuthorizeRequestValidation.CimdClient =>
                await AskSignedInUserToConsent(request, context),

            _ => throw new UnreachableException()
        };

    private Task<IResult> AuthorizeSignedInUser(AuthorizeRequestValidation.Accepted request, HttpContext context) =>
        WithSignedInUser(
            context,
            whenAllowed: email => Task.FromResult(
                Results.Redirect(authorizationResponse.RedirectUrlWithCode(request, email))),
            whenNotAllowed: () => Results.Redirect(authorizationResponse.RedirectUrlWithError(
                request.RedirectUri, request.State, "access_denied", AccountNotAllowed)));

    private Task<IResult> AskSignedInUserToConsent(AuthorizeRequest request, HttpContext context) =>
        WithSignedInUser(
            context,
            whenAllowed: async email => await cimdClientValidator.Validate(request, context.RequestAborted) switch
            {
                CimdClientValidation.Refused refused => Refuse(refused.Reason),

                CimdClientValidation.Accepted accepted =>
                    RedirectToConsentPage(new McpConsentRequest(accepted.Request, accepted.Client, email)),

                _ => throw new UnreachableException()
            },
            whenNotAllowed: () => Refuse(AccountNotAllowed));

    private async Task<IResult> WithSignedInUser(
        HttpContext context,
        Func<string, Task<IResult>> whenAllowed,
        Func<IResult> whenNotAllowed)
    {
        var authentication = await context.AuthenticateAsync(Constants.AuthenticationSchemes.OAuthGoogle);

        if (!authentication.Succeeded)
        {
            return ChallengeToReturnToThisRequest(context);
        }

        return await AllowedEmailOf(authentication.Principal) is { } email
            ? await whenAllowed(email)
            : whenNotAllowed();
    }

    private async Task<string?> AllowedEmailOf(ClaimsPrincipal user)
    {
        var emailAllowlistCheck = await authorizationService.AuthorizeAsync(
            user,
            Constants.AuthorizationPolicies.GoogleAllowedEmails);

        return emailAllowlistCheck.Succeeded ? user.FindFirstValue(Constants.ClaimTypes.Email) : null;
    }

    private IResult RedirectToConsentPage(McpConsentRequest consentRequest)
    {
        var protectedConsentRequest = consentRequestService.Issue(consentRequest);
        return Results.Redirect($"/#/mcp-consent?consentRequest={Uri.EscapeDataString(protectedConsentRequest)}");
    }

    private static IResult ChallengeToReturnToThisRequest(HttpContext context)
    {
        var returnToThisRequest = new AuthenticationProperties
        {
            RedirectUri = context.Request.GetEncodedPathAndQuery()
        };

        return Results.Challenge(returnToThisRequest, [Constants.AuthenticationSchemes.OAuthGoogle]);
    }

    private static IResult Refuse(string reason) =>
        Results.Text(reason, statusCode: StatusCodes.Status400BadRequest);
}
