using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text.Json;
using FoodDiary.API.Auth;
using FoodDiary.Domain.Exceptions;
using MediatR;
using FoodDiary.Application.Imports.Requests;
using FoodDiary.Contracts.Export.Json;
using Microsoft.AspNetCore.Authorization;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("api/v1/imports")]
    [Authorize(Constants.Policies.GoogleJwt)]
    [ApiExplorerSettings(GroupName = "v1")]
    public class ImportsController : ControllerBase
    {
        private readonly ImportOptions _importOptions;
        private readonly IMediator _mediator;

        public ImportsController(IOptions<ImportOptions> importOptions, IMediator mediator)
        {
            _importOptions = importOptions?.Value ?? throw new ArgumentNullException(nameof(importOptions));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        /// <summary>
        /// Accepts JSON file with diary pages data in custom format.
        /// If it's valid, imports all data from this file
        /// </summary>
        /// <param name="importFile">Import form data</param>
        /// <param name="cancellationToken"></param>
        [HttpPost("json")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
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

            var serializerOptions = new JsonSerializerOptions() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            JsonExportFileDto jsonExportFileDto;

            using (var importFileStream = importFile.OpenReadStream())
            {
                try
                {
                    jsonExportFileDto = await JsonSerializer.DeserializeAsync<JsonExportFileDto>(importFileStream, serializerOptions, cancellationToken);
                }
                catch (JsonException)
                {
                    throw new ImportException("Failed to import pages: import file has incorrect format");
                }
            }

            await _mediator.Send(new PagesJsonImportRequest(jsonExportFileDto), cancellationToken);
            return Ok();
        }
    }
}
