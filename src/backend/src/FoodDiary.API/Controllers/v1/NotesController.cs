using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Mapping;
using Microsoft.AspNetCore.Mvc;
using FoodDiary.Application.Notes.Create;
using FoodDiary.Application.Notes.Delete;
using FoodDiary.Application.Notes.Get;
using FoodDiary.Application.Notes.GetHistory;
using FoodDiary.Application.Notes.Recognize;
using FoodDiary.Application.Notes.Update;
using FoodDiary.Contracts.Notes;
using FoodDiary.Domain.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/notes")]
[Authorize(Constants.AuthorizationPolicies.GoogleAllowedEmails)]
[ApiExplorerSettings(GroupName = "v1")]
public class NotesController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetNotes(
        [FromQuery] GetNotesRequest request,
        [FromServices] GetNotesQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var query = request.ToGetNotesQuery();
        var result = await handler.Handle(query, cancellationToken);
        return Ok(result.ToGetNotesResponse());
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetNotesHistory(
        [FromQuery] GetNotesHistoryRequest request,
        [FromServices] GetNotesHistoryQueryHandler handler,
        [FromServices] ICaloriesCalculator caloriesCalculator,
        CancellationToken cancellationToken)
    {
        var query = request.ToGetNotesHistoryQuery();
        var result = await handler.Handle(query, cancellationToken);
        return Ok(result.ToGetNotesHistoryResponse(caloriesCalculator));
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
    [HttpDelete("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeleteNote(
        [FromRoute] int id,
        [FromServices] DeleteNoteCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new DeleteNoteCommand(id), cancellationToken);

        return result switch
        {
            DeleteNoteResult.NotFound => NotFound(),
            DeleteNoteResult.Success => Ok(),
            _ => Conflict()
        };
    }

    /// <summary>
    /// Deletes many notes by specified ids
    /// </summary>
    [HttpDelete("batch")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> DeleteNotes(
        [FromBody] IEnumerable<int> ids,
        [FromServices] DeleteNotesCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.Handle(new DeleteNotesCommand(ids.ToList()), cancellationToken);
        return Ok();
    }

    [HttpPost("recognitions")]
    public async Task<IActionResult> RecognizeNote(
        [FromForm] IReadOnlyList<IFormFile> files,
        [FromServices] RecognizeNoteCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var command = new RecognizeNoteCommand(files);
        var result = await handler.Handle(command, cancellationToken);
        
        return result switch
        {
            RecognizeNoteResult.Success s => Ok(s.Response),
            RecognizeNoteResult.Failure f => f.Error.ToActionResult(),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }
}