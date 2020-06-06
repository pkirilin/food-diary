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
    [Route("v1/notes")]
    [ApiExplorerSettings(GroupName = "v1")]
    public class NotesController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly INoteService _noteService;
        private readonly IPageService _pageService;

        public NotesController(
            IMapper mapper,
            INoteService noteService,
            IPageService pageService)
        {
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _noteService = noteService ?? throw new ArgumentNullException(nameof(noteService));
            _pageService = pageService ?? throw new ArgumentNullException(nameof(pageService));
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
            {
                return BadRequest(ModelState);
            }

            var requestedPage = await _pageService.GetPageByIdAsync(notesRequest.PageId, cancellationToken);
            if (requestedPage == null)
            {
                return NotFound();
            }

            var noteEntities = await _noteService.SearchNotesAsync(notesRequest, cancellationToken);
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
            {
                return BadRequest(ModelState);
            }

            if (!await _noteService.IsNoteProductExistsAsync(noteData.ProductId, cancellationToken))
            {
                ModelState.AddModelError(nameof(noteData.ProductId), "Selected product not found");
                return BadRequest(ModelState);
            }

            var note = _mapper.Map<Note>(noteData);
            await _noteService.CreateNoteAsync(note, cancellationToken);
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
            {
                return BadRequest(ModelState);
            }

            if (!await _noteService.IsNoteProductExistsAsync(updatedNoteData.ProductId, cancellationToken))
            {
                ModelState.AddModelError(nameof(updatedNoteData.ProductId), "Selected product not found");
                return BadRequest(ModelState);
            }

            var originalNote = await _noteService.GetNoteByIdAsync(id, cancellationToken);
            if (originalNote == null)
            {
                return NotFound();
            }

            originalNote = _mapper.Map(updatedNoteData, originalNote);
            await _noteService.EditNoteAsync(originalNote, cancellationToken);
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
            var noteForDelete = await _noteService.GetNoteByIdAsync(id, cancellationToken);
            if (noteForDelete == null)
            {
                return NotFound();
            }

            await _noteService.DeleteNoteAsync(noteForDelete, cancellationToken);
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
            var notesForDelete = await _noteService.GetNotesByIdsAsync(ids, cancellationToken);
            if (!_noteService.AreAllNotesFetched(ids, notesForDelete))
            {
                ModelState.AddModelError(String.Empty, "Unable to delete target notes: wrong ids specified");
                return BadRequest(ModelState);
            }

            await _noteService.DeleteNotesAsync(notesForDelete, cancellationToken);
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
            {
                return BadRequest(ModelState);
            }

            var noteForMove = await _noteService.GetNoteByIdAsync(moveRequest.NoteId, cancellationToken);
            if (noteForMove == null)
            {
                return NotFound();
            }

            if (!await _noteService.CanNoteBeMovedAsync(noteForMove, moveRequest, cancellationToken))
            {
                ModelState.AddModelError(String.Empty, "Note cannot be moved on target meal group to the specified position");
                return BadRequest(ModelState);
            }

            await _noteService.MoveNoteAsync(noteForMove, moveRequest, cancellationToken);
            return Ok();
        }
    }
}
