using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Options;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/imports")]
    [ApiExplorerSettings(GroupName = "v1")]
    public class ImportsController : ControllerBase
    {
        private readonly ImportOptions _importOptions;

        private readonly IImportService _importService;

        public ImportsController(IOptions<ImportOptions> importOptions, IImportService importService)
        {
            _importOptions = importOptions?.Value ?? throw new ArgumentNullException(nameof(importOptions));
            _importService = importService ?? throw new ArgumentNullException(nameof(importService));
        }

        [HttpPost("pages/json")]
        public async Task<IActionResult> ImportPagesJson([FromForm] IFormFile importFile, CancellationToken cancellationToken)
        {
            if (importFile == null)
                return BadRequest("Failed to import pages: no file specified");

            if (importFile.Length > _importOptions.MaxImportFileLengthBytes)
                return BadRequest("Failed to import pages: import file is too large");

            PagesJsonExportDto pagesFromJson;

            using (var importFileStream = importFile.OpenReadStream())
            {
                pagesFromJson = await _importService.DeserializePagesFromJsonAsync(importFileStream, cancellationToken);
            }

            await _importService.RunPagesJsonImportAsync(pagesFromJson, cancellationToken);
            return Ok();
        }
    }
}
