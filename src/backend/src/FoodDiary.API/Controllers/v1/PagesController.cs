using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.API.Requests;
using MediatR;
using FoodDiary.Application.Pages.Requests;
using System.Linq;
using FoodDiary.Application.Pages.CreatePage;
using FoodDiary.Application.Pages.UpdatePage;
using Microsoft.AspNetCore.Authorization;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/pages")]
[Authorize(Constants.AuthorizationPolicies.GoogleAllowedEmails)]
[ApiExplorerSettings(GroupName = "v1")]
public class PagesController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly IMediator _mediator;

    public PagesController(IMapper mapper, IMediator mediator)
    {
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
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
            return BadRequest(ModelState);

        var startDate = pagesRequest.StartDate;
        var endDate = pagesRequest.EndDate;

        if (startDate.HasValue && endDate.HasValue && startDate > endDate)
        {
            ModelState.AddModelError(nameof(pagesRequest.StartDate), "Start date cannot be greater than end date");
            return BadRequest(ModelState);
        }

        var getPagesRequest = new GetPagesRequest(
            pagesRequest.SortOrder,
            pagesRequest.StartDate,
            pagesRequest.EndDate,
            pagesRequest.PageNumber,
            pagesRequest.PageSize);
            
        var pagesSearchResult = await _mediator.Send(getPagesRequest, cancellationToken);
        var pagesListResponse = new PagesSearchResultDto()
        {
            PageItems = _mapper.Map<IEnumerable<PageItemDto>>(pagesSearchResult.FoundPages),
            TotalPagesCount = pagesSearchResult.TotalPagesCount
        };
        return Ok(pagesListResponse);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PageContentDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetPageById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var pageContent = await _mediator.Send(new GetPageContentByIdRequest(id), cancellationToken);

        if (pageContent == null)
        {
            return NotFound();
        }

        var pageContentDto = new PageContentDto
        {
            CurrentPage = _mapper.Map<PageDto>(pageContent.CurrentPage)
        };
            
        return Ok(pageContentDto);
    }
    
    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreatePage(
        [FromBody] PageCreateEditRequest body,
        CancellationToken cancellationToken)
    {
        var request = new CreatePageRequest(body.Date);
        var response = await _mediator.Send(request, cancellationToken);

        return response switch
        {
            CreatePageResponse.PageAlreadyExists => PageAlreadyExists(body.Date),
            CreatePageResponse.Success success => Ok(success.Id),
            _ => Conflict()
        };
    }
    
    [HttpPut("{id:int}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> UpdatePage(
        [FromRoute] int id,
        [FromBody] PageCreateEditRequest body,
        CancellationToken cancellationToken)
    {
        var request = new UpdatePageRequest(id, body.Date);
        var response = await _mediator.Send(request, cancellationToken);

        return response switch
        {
            UpdatePageResponse.PageAlreadyExists => PageAlreadyExists(body.Date),
            UpdatePageResponse.PageNotFound => NotFound(),
            UpdatePageResponse.Success => Ok(),
            _ => Conflict()
        };
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
        var pageForDelete = await _mediator.Send(new GetPageByIdRequest(id), cancellationToken);

        if (pageForDelete == null)
            return NotFound();

        await _mediator.Send(new DeletePageRequest(pageForDelete), cancellationToken);
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
        var pagesForDelete = await _mediator.Send(new GetPagesByIdsRequest(ids), cancellationToken);
        await _mediator.Send(new DeletePagesRequest(pagesForDelete), cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Gets suggested date for next page that is going to be created
    /// </summary>
    [HttpGet("date")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetDateForNewPage(CancellationToken cancellationToken)
    {
        var dateForNewPage = await _mediator.Send(new GetDateForNewPageRequest(), cancellationToken);
        return Ok(dateForNewPage.ToString("yyyy-MM-dd"));
    }

    private IActionResult PageAlreadyExists(DateOnly date)
    {
        ModelState.AddModelError(nameof(date), $"Page with date '${date.ToShortDateString()}' already exists");
        return BadRequest(ModelState);
    }
}