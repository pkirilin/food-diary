using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Options;
using FoodDiary.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using FoodDiary.Import.Models;
using System.Net;
using Microsoft.AspNetCore.Mvc.ModelBinding;

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

        /// <summary>
        /// Accepts JSON file with diary pages data in custom format.
        /// If it's valid, imports all data from this file
        /// </summary>
        /// <param name="importFile">Import form data</param>
        /// <param name="cancellationToken"></param>
        [HttpPost("json")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ImportPagesJson([FromForm] IFormFile importFile, CancellationToken cancellationToken)
        {
            if (importFile == null)
            {
                ModelState.AddModelError(nameof(importFile), "No import file specified");
                return BadRequest(ModelState);
            }

            if (importFile.Length > _importOptions.MaxImportFileLengthBytes)
            {
                ModelState.AddModelError(nameof(importFile), "Import file is too large");
                return BadRequest(ModelState);
            }

            PagesJsonObject pagesJsonObject;

            using (var importFileStream = importFile.OpenReadStream())
            {
                pagesJsonObject = await _importService.DeserializePagesFromJsonAsync(importFileStream, cancellationToken);
            }

            await _importService.RunPagesJsonImportAsync(pagesJsonObject, cancellationToken);
            return Ok();
        }
    }
}
