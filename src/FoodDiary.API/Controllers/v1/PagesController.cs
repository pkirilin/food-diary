using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/pages")]
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
        public async Task<IActionResult> GetPagesList([FromQuery] PageFilterDto pageFilter, CancellationToken cancellationToken = default)
        {
            var filteredPages = await _pageService.SearchPagesAsync(pageFilter, cancellationToken);
            var pagesListResponse = _mapper.Map<List<PageItemDto>>(filteredPages);
            return Ok(pagesListResponse);
        }

        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreatePage([FromBody] PageCreateDto request, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var page = _mapper.Map<Page>(request);

            if (!await _pageService.PageCanBeCreatedAsync(request, cancellationToken))
            {
                return BadRequest($"Page with the date '{page.Date.ToString("yyyy-MM-dd")}' already exists");
            }

            await _pageService.CreatePageAsync(page, cancellationToken);
            return Ok();
        }

        [HttpPut]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> EditPage([FromBody] PageEditDto request, CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var originalPage = await _pageService.GetPageByIdAsync(request.Id, cancellationToken);
            if (originalPage == null)
            {
                return NotFound();
            }

            if (!await _pageService.PageCanBeUpdatedAsync(request, originalPage, cancellationToken))
            {
                return BadRequest($"Page with the date '{request.Date.ToString("yyyy-MM-dd")}' already exists");
            }

            originalPage = _mapper.Map(request, originalPage);
            await _pageService.EditPageAsync(originalPage, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        public async Task<IActionResult> DeletePage([FromRoute] int id, CancellationToken cancellationToken = default)
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
        public async Task<IActionResult> DeletePages([FromBody] List<int> ids, CancellationToken cancellationToken = default)
        {
            var pageCollectionForDelete = await _pageService.GetPagesByIdsAsync(ids, cancellationToken);
            if (pageCollectionForDelete.Count != ids.Count)
            {
                return BadRequest();
            }

            await _pageService.BatchDeletePagesAsync(pageCollectionForDelete, cancellationToken);
            return Ok();
        }
    }
}
