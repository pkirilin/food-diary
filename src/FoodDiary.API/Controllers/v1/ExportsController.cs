using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Services;
using FoodDiary.PdfGenerator;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/exports")]
    [ApiExplorerSettings(GroupName = "v1")]
    public class ExportsController : ControllerBase
    {
        private readonly IExportService _exportService;
        private readonly IPagesPdfGenerator _pagesPdfGenerator;

        public ExportsController(IExportService exportService, IPagesPdfGenerator pagesPdfGenerator)
        {
            _exportService = exportService ?? throw new ArgumentNullException(nameof(exportService));
            _pagesPdfGenerator = pagesPdfGenerator ?? throw new ArgumentNullException(nameof(pagesPdfGenerator));
        }

        [HttpGet("pages/pdf")]
        [ProducesResponseType(typeof(byte[]), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ExportPagesPdf([FromQuery] PagesExportRequestDto request, CancellationToken cancellationToken)
        {
            if (request.StartDate > request.EndDate)
            {
                ModelState.AddModelError(nameof(request.StartDate), "Start date cannot be greater than end date");
                return BadRequest(ModelState);
            }

            var pagesForExport = await _exportService.GetPagesForExportAsync(request.StartDate, request.EndDate, cancellationToken);
            
            var fileContents = _pagesPdfGenerator.GeneratePdfForPages(pagesForExport);
            return File(fileContents, "application/octet-stream");
        }
    }
}
