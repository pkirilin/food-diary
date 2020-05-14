using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Dtos;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface INoteService
    {
        Task<Note> GetNoteByIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<Note>> SearchNotesAsync(NotesSearchRequest request, CancellationToken cancellationToken);

        Task<IEnumerable<Note>> GetNotesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Task<ValidationResultDto> ValidateNoteDataAsync(NoteCreateEditRequest noteData, CancellationToken cancellationToken);

        Task<Note> CreateNoteAsync(Note note, CancellationToken cancellationToken);

        Task EditNoteAsync(Note note, CancellationToken cancellationToken);

        Task DeleteNoteAsync(Note note, CancellationToken cancellationToken);

        bool AllNotesFetched(IEnumerable<int> requestedIds, IEnumerable<Note> fetchedNotes);

        Task DeleteNotesAsync(IEnumerable<Note> notes, CancellationToken cancellationToken);

        Task<bool> NoteCanBeMovedAsync(Note noteForMove, NoteMoveRequest moveRequest, CancellationToken cancellationToken);

        Task<Note> MoveNoteAsync(Note noteForMove, NoteMoveRequest moveRequest, CancellationToken cancellationToken);
    }
}
