using System.Diagnostics;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;

namespace FoodDiary.API.Mcp.Authorization;

internal sealed class AuthorizeRequestHandler(
    AuthorizeRequestValidator validator,
    IAuthorizationService authorizationService,
    McpTokenService tokenService,
    IOptions<McpOptions> options)
{
    public async Task<IResult> Handle(AuthorizeRequest request, HttpContext context) =>
        validator.Validate(request) switch
        {
            AuthorizeRequestValidation.Refused refused =>
                Results.Text(refused.Reason, statusCode: StatusCodes.Status400BadRequest),

            AuthorizeRequestValidation.ErrorRedirect error =>
                RedirectToClient(error.RedirectUri, error.State,
                    ("error", error.Error),
                    ("error_description", error.Description)),

            AuthorizeRequestValidation.Accepted accepted =>
                await AuthorizeSignedInUser(accepted, context),

            _ => throw new UnreachableException()
        };

    private async Task<IResult> AuthorizeSignedInUser(AuthorizeRequestValidation.Accepted request, HttpContext context)
    {
        var authentication = await context.AuthenticateAsync(Constants.AuthenticationSchemes.OAuthGoogle);

        if (!authentication.Succeeded)
        {
            var returnToThisRequest = new AuthenticationProperties
            {
                RedirectUri = context.Request.GetEncodedPathAndQuery()
            };

            return Results.Challenge(returnToThisRequest, [Constants.AuthenticationSchemes.OAuthGoogle]);
        }

        var emailAllowlistCheck = await authorizationService.AuthorizeAsync(
            authentication.Principal,
            Constants.AuthorizationPolicies.GoogleAllowedEmails);

        if (!emailAllowlistCheck.Succeeded)
        {
            return RedirectToClient(request.RedirectUri, request.State,
                ("error", "access_denied"),
                ("error_description", "This account is not allowed to use Food Diary"));
        }

        var access = new AccessGrant(
            request.ClientId,
            authentication.Principal.FindFirstValue(Constants.ClaimTypes.Email)!,
            request.Scope,
            request.Resource);

        var code = tokenService.IssueAuthorizationCode(
            new AuthorizationCodeGrant(access, request.RedirectUri, request.CodeChallenge));

        return RedirectToClient(request.RedirectUri, request.State, ("code", code));
    }

    private IResult RedirectToClient(string redirectUri, string? state, params (string Name, string Value)[] parameters)
    {
        var query = parameters
            .Select(parameter => KeyValuePair.Create(parameter.Name, (string?)parameter.Value))
            .Append(KeyValuePair.Create("state", state))
            .Append(KeyValuePair.Create("iss", options.Value.BaseUrl));

        return Results.Redirect(QueryHelpers.AddQueryString(redirectUri, query));
    }
}
