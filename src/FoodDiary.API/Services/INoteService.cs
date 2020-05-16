using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface INoteService
    {
        Task<Note> GetNoteByIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<Note>> SearchNotesAsync(NotesSearchRequest request, CancellationToken cancellationToken);

        Task<IEnumerable<Note>> GetNotesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Task<bool> IsNoteProductExistsAsync(int productId, CancellationToken cancellationToken);

        Task<Note> CreateNoteAsync(Note note, CancellationToken cancellationToken);

        Task EditNoteAsync(Note note, CancellationToken cancellationToken);

        Task DeleteNoteAsync(Note note, CancellationToken cancellationToken);

        bool AreAllNotesFetched(IEnumerable<int> requestedIds, IEnumerable<Note> fetchedNotes);

        Task DeleteNotesAsync(IEnumerable<Note> notes, CancellationToken cancellationToken);

        Task<bool> CanNoteBeMovedAsync(Note noteForMove, NoteMoveRequest moveRequest, CancellationToken cancellationToken);

        Task<Note> MoveNoteAsync(Note noteForMove, NoteMoveRequest moveRequest, CancellationToken cancellationToken);
    }
}
