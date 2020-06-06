using System;
using System.IO;
using System.Net;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FoodDiary.API.Services;
using FoodDiary.PdfGenerator;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.API.Requests;
using FoodDiary.Import.Models;
using System.Text.Encodings.Web;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/exports")]
    [ApiExplorerSettings(GroupName = "v1")]
    public class ExportsController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IExportService _exportService;
        private readonly IPagesPdfGenerator _pagesPdfGenerator;

        public ExportsController(IMapper mapper, IExportService exportService, IPagesPdfGenerator pagesPdfGenerator)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _exportService = exportService ?? throw new ArgumentNullException(nameof(exportService));
            _pagesPdfGenerator = pagesPdfGenerator ?? throw new ArgumentNullException(nameof(pagesPdfGenerator));
        }

        /// <summary>
        /// Exports diary pages with notes and products info to PDF document
        /// </summary>
        /// <param name="exportRequest">Parameters to determine which pages should be exported</param>
        /// <param name="cancellationToken"></param>
        [HttpGet("pdf")]
        [ProducesResponseType(typeof(byte[]), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ExportPagesPdf([FromQuery] PagesExportRequest exportRequest, CancellationToken cancellationToken)
        {
            if (exportRequest.StartDate > exportRequest.EndDate)
            {
                ModelState.AddModelError(nameof(exportRequest.StartDate), "Start date cannot be greater than end date");
                return BadRequest(ModelState);
            }

            var pagesForExport = await _exportService.GetPagesForExportAsync(exportRequest.StartDate, exportRequest.EndDate, false, cancellationToken);
            
            var fileContents = _pagesPdfGenerator.GeneratePdfForPages(pagesForExport);
            return File(fileContents, "application/octet-stream");
        }

        /// <summary>
        /// Exports diary pages with notes, products and categories to JSON file
        /// </summary>
        /// <param name="exportRequest">Parameters to determine which pages should be exported</param>
        /// <param name="cancellationToken"></param>
        [HttpGet("json")]
        [ProducesResponseType(typeof(byte[]), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> ExportPagesJson([FromQuery] PagesExportRequest exportRequest, CancellationToken cancellationToken)
        {
            if (exportRequest.StartDate > exportRequest.EndDate)
            {
                ModelState.AddModelError(nameof(exportRequest.StartDate), "Start date cannot be greater than end date");
                return BadRequest(ModelState);
            }

            var pagesForExport = await _exportService.GetPagesForExportAsync(exportRequest.StartDate, exportRequest.EndDate, true, cancellationToken);
            var pagesJsonExportObject = _mapper.Map<PagesJsonObject>(pagesForExport);

            byte[] fileContents;
            using (var stream = new MemoryStream())
            {
                var options = new JsonSerializerOptions
                { 
                    WriteIndented = true, 
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                };

                await JsonSerializer.SerializeAsync(stream, pagesJsonExportObject, options, cancellationToken);
                fileContents = stream.ToArray();
            }

            return File(fileContents, "application/octet-stream");
        }
    }
}
