using System;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.API.Requests;
using FoodDiary.Application.Notes.Create;
using FoodDiary.Application.Notes.Recognize;
using MediatR;
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Application.Notes.Update;
using FoodDiary.Contracts.Notes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/notes")]
[Authorize(Constants.AuthorizationPolicies.GoogleAllowedEmails)]
[ApiExplorerSettings(GroupName = "v1")]
public class NotesController : ControllerBase
{
    private readonly IMapper _mapper;
    private readonly IMediator _mediator;

    public NotesController(IMapper mapper, IMediator mediator)
    {
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
    }

    /// <summary>
    /// Gets all notes by specified parameters
    /// </summary>
    /// <param name="notesRequest">Notes search parameters</param>
    /// <param name="cancellationToken"></param>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<NoteItemDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetNotes([FromQuery] NotesSearchRequest notesRequest, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var noteEntities = await _mediator.Send(new GetNotesRequest(notesRequest.PageId, notesRequest.MealType), cancellationToken);
        var notesListResponse = _mapper.Map<IEnumerable<NoteItemDto>>(noteEntities);
        return Ok(notesListResponse);
    }
    
    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateNote(
        [FromBody] NoteRequestBody body,
        [FromServices] CreateNoteCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var command = body.ToCreateNoteCommand();
        var result = await handler.Handle(command, cancellationToken);

        return result switch
        {
            CreateNoteResult.Success => Ok(),
            CreateNoteResult.Failure f => f.Error.ToActionResult(),
            _ => StatusCode(StatusCodes.Status501NotImplemented)
        };
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> UpdateNote(
        [FromRoute] int id,
        [FromBody] NoteRequestBody body,
        [FromServices] UpdateNoteCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var command = body.ToUpdateNoteCommand(id);
        var result = await handler.Handle(command, cancellationToken);
        
        return result switch
        {
            UpdateNoteResult.Success => Ok(),
            UpdateNoteResult.Failure f => f.Error.ToActionResult(),
            _ => StatusCode(StatusCodes.Status501NotImplemented)
        };
    }

    /// <summary>
    /// Deletes note by id
    /// </summary>
    /// <param name="id">Note for delete id</param>
    /// <param name="cancellationToken"></param>
    [HttpDelete("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeleteNote([FromRoute] int id, CancellationToken cancellationToken)
    {
        var noteForDelete = await _mediator.Send(new GetNoteByIdRequest(id), cancellationToken);

        if (noteForDelete == null)
            return NotFound();

        await _mediator.Send(new DeleteNoteRequest(noteForDelete), cancellationToken);
        return Ok();
    }

    /// <summary>
    /// Deletes many notes by specified ids
    /// </summary>
    /// <param name="ids">Notes ids</param>
    /// <param name="cancellationToken"></param>
    [HttpDelete("batch")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> DeleteNotes([FromBody] IEnumerable<int> ids, CancellationToken cancellationToken)
    {
        var notesForDelete = await _mediator.Send(new GetNotesByIdsRequest(ids), cancellationToken);
        await _mediator.Send(new DeleteNotesRequest(notesForDelete), cancellationToken);
        return Ok();
    }

    [HttpPost("recognitions")]
    public async Task<IActionResult> RecognizeNote(
        [FromForm] IReadOnlyList<IFormFile> files,
        CancellationToken cancellationToken)
    {
        var request = new RecognizeNoteRequest(files);
        var result = await _mediator.Send(request, cancellationToken);
        return result.ToActionResult();
    }
}