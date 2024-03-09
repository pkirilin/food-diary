using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.Application.Services.Export;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Authorize(Constants.AuthorizationPolicies.GoogleAllowedEmails)]
[Route("api/v1/exports")]
public class ExportsController(IExportService exportService) : ControllerBase
{
    [HttpGet("json")]
    public async Task<IActionResult> ExportToJson([FromQuery] ExportRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request.StartDate > request.EndDate)
        {
            ModelState.AddModelError(nameof(request.StartDate), "Start date cannot be greater than end date");
            return BadRequest(ModelState);
        }
            
        var fileContents = await exportService.ExportToJsonAsync(request, cancellationToken);
            
        return File(fileContents, "application/json");
    }

    [HttpPost("google-docs")]
    public async Task<IActionResult> ExportToGoogleDocs([FromBody] ExportToGoogleDocsRequestDto request,
        CancellationToken cancellationToken)
    {
        var authResult = await HttpContext.AuthenticateAsync(Constants.AuthenticationSchemes.OAuthGoogle);
        var accessToken = authResult.Properties?.GetTokenValue(Constants.OpenIdConnectParameters.AccessToken);

        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return Unauthorized();
        }
        
        var exportResponse = await exportService.ExportToGoogleDocsAsync(request, accessToken, cancellationToken);
            
        return Ok(exportResponse);
    }
}