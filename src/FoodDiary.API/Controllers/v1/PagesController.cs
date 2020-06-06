using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FoodDiary.API.Services;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.API.Requests;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/pages")]
    [ApiExplorerSettings(GroupName = "v1")]
    public class PagesController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IPageService _pageService;

        public PagesController(IMapper mapper, IPageService pageService)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _pageService = pageService ?? throw new ArgumentNullException(nameof(pageService));
        }

        /// <summary>
        /// Gets pages list by specified parameters
        /// </summary>
        /// <param name="pagesRequest">Pages search parameters</param>
        /// <param name="cancellationToken"></param>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<PageItemDto>), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetPages([FromQuery] PagesSearchRequest pagesRequest, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!_pageService.AreDateRangesValid(pagesRequest.StartDate, pagesRequest.EndDate))
            {
                ModelState.AddModelError(nameof(pagesRequest.StartDate), "Start date cannot be greater than end date");
                return BadRequest(ModelState);
            }

            var filteredPages = await _pageService.SearchPagesAsync(pagesRequest, cancellationToken);
            var pagesListResponse = _mapper.Map<IEnumerable<PageItemDto>>(filteredPages);
            return Ok(pagesListResponse);
        }

        /// <summary>
        /// Creates new page if page with the same date doesn't exist
        /// </summary>
        /// <param name="pageData">New page info</param>
        /// <param name="cancellationToken"></param>
        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreatePage([FromBody] PageCreateEditRequest pageData, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _pageService.IsPageExistsAsync(pageData.Date, cancellationToken))
            {
                ModelState.AddModelError(nameof(pageData.Date), $"Page with date '${pageData.Date.ToShortDateString()}' already exists");
                return BadRequest(ModelState);
            }

            var page = _mapper.Map<Page>(pageData);
            var createdPage = await _pageService.CreatePageAsync(page, cancellationToken);
            return Ok(createdPage.Id);
        }

        /// <summary>
        /// Updates page by specified id
        /// </summary>
        /// <param name="id">Page for update id</param>
        /// <param name="updatedPageData">Updated page info</param>
        /// <param name="cancellationToken"></param>
        [HttpPut("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> EditPage([FromRoute] int id, [FromBody] PageCreateEditRequest updatedPageData, CancellationToken cancellationToken)
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

            var isPageExists = await _pageService.IsPageExistsAsync(updatedPageData.Date, cancellationToken);
            if (!_pageService.IsEditedPageValid(updatedPageData, originalPage, isPageExists))
            {
                ModelState.AddModelError(nameof(updatedPageData.Date), $"Page with date '${updatedPageData.Date.ToShortDateString()}' already exists");
                return BadRequest(ModelState);
            }

            originalPage = _mapper.Map(updatedPageData, originalPage);
            await _pageService.EditPageAsync(originalPage, cancellationToken);
            return Ok();
        }

        /// <summary>
        /// Deletes page by specified id
        /// </summary>
        /// <param name="id">Page for delete id</param>
        /// <param name="cancellationToken"></param>
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

        /// <summary>
        /// Deletes pages by specified ids
        /// </summary>
        /// <param name="ids">Pages for delete ids</param>
        /// <param name="cancellationToken"></param>
        [HttpDelete("batch")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> DeletePages([FromBody] ICollection<int> ids, CancellationToken cancellationToken)
        {
            var pagesForDelete = await _pageService.GetPagesByIdsAsync(ids, cancellationToken);
            if (pagesForDelete.Count != ids.Count)
            {
                ModelState.AddModelError(String.Empty, "Pages cannot be deleted: wrong ids specified");
                return BadRequest(ModelState);
            }

            await _pageService.DeletePagesAsync(pagesForDelete, cancellationToken);
            return Ok();
        }

        /// <summary>
        /// Gets suggested date for next page that is going to be created
        /// </summary>
        [HttpGet("date")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetDateForNewPage(CancellationToken cancellationToken)
        {
            var dateForNewPage = await _pageService.GetDateForNewPageAsync(cancellationToken);
            return Ok(dateForNewPage.ToString("yyyy-MM-dd"));
        }
    }
}
