using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface INoteService
    {
        /// <summary>
        /// Gets note by specified id
        /// </summary>
        Task<Note> GetNoteByIdAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Gets notes by specified parameters
        /// </summary>
        Task<IEnumerable<Note>> SearchNotesAsync(NotesSearchRequest notesRequest, CancellationToken cancellationToken);

        /// <summary>
        /// Gets notes by specified ids
        /// </summary>
        Task<IEnumerable<Note>> GetNotesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        /// <summary>
        /// Checks if product from note exists by id
        /// </summary>
        Task<bool> IsNoteProductExistsAsync(int productId, CancellationToken cancellationToken);

        /// <summary>
        /// Creates new note
        /// </summary>
        /// <returns>Created note</returns>
        Task<Note> CreateNoteAsync(Note note, CancellationToken cancellationToken);

        /// <summary>
        /// Updates existing note
        /// </summary>
        Task EditNoteAsync(Note note, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes existing note
        /// </summary>
        Task DeleteNoteAsync(Note note, CancellationToken cancellationToken);

        /// <summary>
        /// Ensures if all requested notes ids contain in fetched notes
        /// </summary>
        /// <param name="requestedIds">Requested notes ids</param>
        /// <param name="fetchedNotes">Fetched notes</param>
        bool AreAllNotesFetched(IEnumerable<int> requestedIds, IEnumerable<Note> fetchedNotes);

        /// <summary>
        /// Deletes existing notes
        /// </summary>
        Task DeleteNotesAsync(IEnumerable<Note> notes, CancellationToken cancellationToken);

        /// <summary>
        /// Checks if note can be moved by specified parameters
        /// </summary>
        /// <param name="noteForMove">Note for move</param>
        /// <param name="moveRequest">Parameters for moving note</param>
        /// <param name="cancellationToken"></param>
        Task<bool> CanNoteBeMovedAsync(Note noteForMove, NoteMoveRequest moveRequest, CancellationToken cancellationToken);

        /// <summary>
        /// Moves note by specified parameters
        /// </summary>
        /// <param name="noteForMove">Note for move</param>
        /// <param name="moveRequest">Parameters for moving note</param>
        /// <param name="cancellationToken"></param>
        /// <returns>Moved note</returns>
        Task<Note> MoveNoteAsync(Note noteForMove, NoteMoveRequest moveRequest, CancellationToken cancellationToken);
    }
}
