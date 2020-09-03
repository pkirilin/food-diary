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
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Application.Products.Requests;

namespace FoodDiary.API.Controllers.v1
{
    [ApiController]
    [Route("v1/notes")]
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

        /// <summary>
        /// Creates new note
        /// </summary>
        /// <param name="noteData">New note info</param>
        /// <param name="cancellationToken"></param>
        [HttpPost]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        public async Task<IActionResult> CreateNote([FromBody] NoteCreateEditRequest noteData, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = await _mediator.Send(new GetProductByIdRequest(noteData.ProductId), cancellationToken);

            if (product == null)
            {
                ModelState.AddModelError(nameof(noteData.ProductId), "Selected product does not exist");
                return BadRequest(ModelState);
            }

            var note = _mapper.Map<Note>(noteData);
            await _mediator.Send(new CreateNoteRequest(note), cancellationToken);
            return Ok();
        }

        /// <summary>
        /// Updates existing note
        /// </summary>
        /// <param name="id">Note for update id</param>
        /// <param name="updatedNoteData">Updated note info</param>
        /// <param name="cancellationToken"></param>
        [HttpPut("{id}")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> EditNote([FromRoute] int id, [FromBody] NoteCreateEditRequest updatedNoteData, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = await _mediator.Send(new GetProductByIdRequest(updatedNoteData.ProductId), cancellationToken);

            if (product == null)
            {
                ModelState.AddModelError(nameof(updatedNoteData.ProductId), "Selected product does not exist");
                return BadRequest(ModelState);
            }

            var originalNote = await _mediator.Send(new GetNoteByIdRequest(id), cancellationToken);

            if (originalNote == null)
                return NotFound();

            originalNote = _mapper.Map(updatedNoteData, originalNote);
            await _mediator.Send(new EditNoteRequest(originalNote), cancellationToken);
            return Ok();
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

        /// <summary>
        /// Moves note by specified parameters
        /// </summary>
        /// <param name="moveRequest">Parameters for moving note</param>
        /// <param name="cancellationToken"></param>
        [HttpPut("move")]
        [ProducesResponseType((int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        public async Task<IActionResult> MoveNote([FromBody] NoteMoveRequest moveRequest, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var noteForMove = await _mediator.Send(new GetNoteByIdRequest(moveRequest.NoteId), cancellationToken);

            if (noteForMove == null)
                return NotFound();

            var orderLimit = await _mediator.Send(new GetOrderForNewNoteRequest(noteForMove.PageId, moveRequest.DestMeal), cancellationToken);

            if (moveRequest.Position < 0 || moveRequest.Position > orderLimit)
            {
                ModelState.AddModelError(String.Empty, "Note cannot be moved on target meal group to the specified position");
                return BadRequest(ModelState);
            }

            await _mediator.Send(new MoveNoteRequest(noteForMove, moveRequest.DestMeal, moveRequest.Position), cancellationToken);
            return Ok();
        }
    }
}
