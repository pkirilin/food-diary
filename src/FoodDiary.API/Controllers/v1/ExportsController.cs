using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.Application.Services.Export;
using Microsoft.AspNetCore.Authorization;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Authorize]
    [Route("api/v1/exports")]
    public class ExportsController : ControllerBase
    {
        private readonly IExportService _exportService;

        public ExportsController(IExportService exportService)
        {
            _exportService = exportService;
        }

        [HttpGet("json")]
        public async Task<IActionResult> ExportToJson([FromQuery] ExportRequestDto request,
            CancellationToken cancellationToken)
        {
            if (request.StartDate > request.EndDate)
            {
                ModelState.AddModelError(nameof(request.StartDate), "Start date cannot be greater than end date");
                return BadRequest(ModelState);
            }
            
            var fileContents = await _exportService.ExportToJsonAsync(request, cancellationToken);
            
            return File(fileContents, "application/json");
        }

        [HttpPost("google-docs")]
        public async Task<IActionResult> ExportToGoogleDocs([FromBody] ExportToGoogleDocsRequestDto request,
            CancellationToken cancellationToken)
        {
            var exportResponse = await _exportService.ExportToGoogleDocsAsync(request, cancellationToken);
            
            return Ok(exportResponse);
        }
    }
}
