using System.Diagnostics;
using System.Security.Claims;
using FoodDiary.API.Mcp.Authorization.Cimd;
using FoodDiary.API.Mcp.Authorization.Consent;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp.Authorization;

internal sealed class AuthorizeRequestHandler(
    AuthorizeRequestValidator validator,
    CimdClientValidator cimdClientValidator,
    IAuthorizationService authorizationService,
    McpTokenService tokenService,
    McpConsentRequestService consentRequestService,
    IOptions<McpOptions> options)
{
    private const string AccountNotAllowed = "This account is not allowed to use Food Diary";

    public async Task<IResult> Handle(AuthorizeRequest request, HttpContext context) =>
        validator.Validate(request) switch
        {
            AuthorizeRequestValidation.Refused refused => Refuse(refused.Reason),

            AuthorizeRequestValidation.ErrorRedirect error =>
                RedirectToClient(error.RedirectUri, error.State,
                    ("error", error.Error),
                    ("error_description", error.Description)),

            AuthorizeRequestValidation.Accepted accepted =>
                await AuthorizeSignedInUser(accepted, context),

            AuthorizeRequestValidation.CimdClient =>
                await AskSignedInUserToConsent(request, context),

            _ => throw new UnreachableException()
        };

    private async Task<IResult> AuthorizeSignedInUser(AuthorizeRequestValidation.Accepted request, HttpContext context)
    {
        var authentication = await context.AuthenticateAsync(Constants.AuthenticationSchemes.OAuthGoogle);

        if (!authentication.Succeeded)
        {
            return ChallengeToReturnToThisRequest(context);
        }

        if (await AllowedEmailOf(authentication.Principal) is not { } email)
        {
            return RedirectToClient(request.RedirectUri, request.State,
                ("error", "access_denied"),
                ("error_description", AccountNotAllowed));
        }

        var access = new AccessGrant(request.ClientId, email, request.Scope, request.Resource);

        var code = tokenService.IssueAuthorizationCode(
            new AuthorizationCodeGrant(access, request.RedirectUri, request.CodeChallenge));

        return RedirectToClient(request.RedirectUri, request.State, ("code", code));
    }

    private async Task<IResult> AskSignedInUserToConsent(AuthorizeRequest request, HttpContext context)
    {
        var authentication = await context.AuthenticateAsync(Constants.AuthenticationSchemes.OAuthGoogle);

        if (!authentication.Succeeded)
        {
            return ChallengeToReturnToThisRequest(context);
        }

        if (await AllowedEmailOf(authentication.Principal) is not { } email)
        {
            return Refuse(AccountNotAllowed);
        }

        return await cimdClientValidator.Validate(request, context.RequestAborted) switch
        {
            CimdClientValidation.Refused refused => Refuse(refused.Reason),

            CimdClientValidation.Accepted accepted =>
                RedirectToConsentPage(new McpConsentRequest(accepted.Request, accepted.Client, email)),

            _ => throw new UnreachableException()
        };
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

    private IResult RedirectToClient(string redirectUri, string? state, params (string Name, string Value)[] parameters) =>
        Results.Redirect(AuthorizationResponse.RedirectUrl(redirectUri, state, options.Value.BaseUrl!, parameters));
}
