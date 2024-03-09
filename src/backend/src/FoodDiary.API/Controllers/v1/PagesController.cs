using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Dtos;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.API.Requests;
using MediatR;
using FoodDiary.API.Mapping;
using FoodDiary.Application.Pages.CreatePage;
using FoodDiary.Application.Pages.Delete;
using FoodDiary.Application.Pages.Find;
using FoodDiary.Application.Pages.GetDateForNewPage;
using FoodDiary.Application.Pages.UpdatePage;
using FoodDiary.Domain.Utils;
using Microsoft.AspNetCore.Authorization;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/pages")]
[Authorize(Constants.AuthorizationPolicies.GoogleAllowedEmails)]
[ApiExplorerSettings(GroupName = "v1")]
public class PagesController(
    ISender sender,
    ICaloriesCalculator caloriesCalculator) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PageItemDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetPages([FromQuery] PagesSearchRequest pagesRequest, CancellationToken cancellationToken)
    {
        var request = new FindPagesRequest(
            pagesRequest.SortOrder,
            pagesRequest.StartDate,
            pagesRequest.EndDate,
            pagesRequest.PageNumber,
            pagesRequest.PageSize);
        
        var response = await sender.Send(request, cancellationToken);
        
        return response switch
        {
            FindPagesResponse.StartDateIsGreaterThanEndDate => StartDateIsGreaterThanEndDate(nameof(FindPagesRequest.StartDate)),
            FindPagesResponse.Success success => Ok(success.ToPagesSearchResultDto(caloriesCalculator)),
            _ => Conflict()
        };
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PageContentDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> GetPageById([FromRoute] int id, CancellationToken cancellationToken)
    {
        var request = new FindPageByIdRequest(id);
        var response = await sender.Send(request, cancellationToken);
        
        return response switch
        {
            FindPageByIdResponse.PageNotFound => NotFound(),
            FindPageByIdResponse.Success success => Ok(success.Page.ToPageContentDto()),
            _ => Conflict()
        };
    }
    
    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreatePage(
        [FromBody] PageCreateEditRequest body,
        CancellationToken cancellationToken)
    {
        var request = new CreatePageRequest(body.Date);
        var response = await sender.Send(request, cancellationToken);

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
        var response = await sender.Send(request, cancellationToken);

        return response switch
        {
            UpdatePageResponse.PageAlreadyExists => PageAlreadyExists(body.Date),
            UpdatePageResponse.PageNotFound => NotFound(),
            UpdatePageResponse.Success => Ok(),
            _ => Conflict()
        };
    }
    
    [HttpDelete("{id:int}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeletePage([FromRoute] int id, CancellationToken cancellationToken)
    {
        var request = new DeletePageRequest(id);
        var response = await sender.Send(request, cancellationToken);
        
        return response switch
        {
            DeletePageResponse.PageNotFound => NotFound(),
            DeletePageResponse.Success => Ok(),
            _ => Conflict()
        };
    }
    
    [HttpDelete("batch")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> DeletePages([FromBody] IReadOnlyList<int> ids, CancellationToken cancellationToken)
    {
        var request = new DeletePagesRequest(ids);
        var response = await sender.Send(request, cancellationToken);
        
        return response switch
        {
            DeletePagesResponse.SomePagesWereNotFound => BadRequest(),
            DeletePagesResponse.Success => Ok(),
            _ => Conflict()
        };
    }
    
    [HttpGet("date")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetDateForNewPage(CancellationToken cancellationToken)
    {
        var response = await sender.Send(new GetDateForNewPageRequest(), cancellationToken);

        return response switch
        {
            GetDateForNewPageResult.Success success => Ok(success.Date.ToString("O")),
            _ => Conflict()
        };
    }

    private BadRequestObjectResult PageAlreadyExists(DateOnly date)
    {
        ModelState.AddModelError(nameof(date), $"Page with date '${date.ToShortDateString()}' already exists");
        return BadRequest(ModelState);
    }
    
    private BadRequestObjectResult StartDateIsGreaterThanEndDate(string key)
    {
        ModelState.AddModelError(key, "Start date cannot be greater than end date");
        return BadRequest(ModelState);
    }
}