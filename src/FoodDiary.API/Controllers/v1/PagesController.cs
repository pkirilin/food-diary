using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FoodDiary.API.Services;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Logging;
using FoodDiary.API.Requests;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/pages")]
    [ApiExplorerSettings(GroupName = "v1")]
    public class PagesController : ControllerBase
    {
        private readonly ILogger<PagesController> _logger;
        private readonly IMapper _mapper;
        private readonly IPageService _pageService;

        public PagesController(
            ILoggerFactory loggerFactory,
            IMapper mapper,
            IPageService pageService)
        {
            _logger = loggerFactory?.CreateLogger<PagesController>() ?? throw new ArgumentNullException(nameof(loggerFactory));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _pageService = pageService ?? throw new ArgumentNullException(nameof(pageService));
        }

        [HttpGet]
        [ProducesResponseType(typeof(List<PageItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetPages([FromQuery] PagesSearchRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var filteredPages = await _pageService.SearchPagesAsync(request, cancellationToken);
            var pagesListResponse = _mapper.Map<List<PageItemDto>>(filteredPages);
            return Ok(pagesListResponse);
        }

        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreatePage([FromBody] PageCreateEditRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var pageValidationResult = await _pageService.ValidatePageAsync(request, cancellationToken);
            if (!pageValidationResult.IsValid)
            {
                ModelState.AddModelError(pageValidationResult.ErrorKey, pageValidationResult.ErrorMessage);
                return BadRequest(ModelState);
            }

            var page = _mapper.Map<Page>(request);
            var createdPage = await _pageService.CreatePageAsync(page, cancellationToken);
            return Ok(createdPage.Id);
        }

        [HttpPut("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> EditPage([FromRoute] int id, [FromBody] PageCreateEditRequest request, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var originalPage = await _pageService.GetPageByIdAsync(id, cancellationToken);
            if (originalPage == null)
            {
                return NotFound();
            }

            var pageValidationResult = await _pageService.ValidatePageAsync(request, cancellationToken);
            if (!_pageService.IsEditedPageValid(request, originalPage, pageValidationResult))
            {
                ModelState.AddModelError(pageValidationResult.ErrorKey, pageValidationResult.ErrorMessage);
                return BadRequest(ModelState);
            }

            originalPage = _mapper.Map(request, originalPage);
            await _pageService.EditPageAsync(originalPage, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> DeletePage([FromRoute] int id, CancellationToken cancellationToken)
        {
            var pageForDelete = await _pageService.GetPageByIdAsync(id, cancellationToken);
            if (pageForDelete == null)
            {
                return NotFound();
            }

            await _pageService.DeletePageAsync(pageForDelete, cancellationToken);
            return Ok();
        }

        [HttpDelete("batch")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(ModelStateDictionary), (int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeletePages([FromBody] List<int> ids, CancellationToken cancellationToken)
        {
            var pagesForDelete = await _pageService.GetPagesByIdsAsync(ids, cancellationToken);
            if (pagesForDelete.Count() != ids.Count)
            {
                ModelState.AddModelError(String.Empty, "Pages cannot be deleted: wrong ids specified");
                return BadRequest(ModelState);
            }

            await _pageService.BatchDeletePagesAsync(pagesForDelete, cancellationToken);
            return Ok();
        }
    }
}
