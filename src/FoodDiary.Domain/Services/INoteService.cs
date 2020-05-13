using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Services
{
    public interface INoteService
    {
        Task<Note> GetNoteByIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<Note>> SearchNotesAsync(NotesSearchRequestDto request, CancellationToken cancellationToken);

        Task<IEnumerable<Note>> GetNotesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Task<ValidationResultDto> ValidateNoteDataAsync(NoteCreateEditDto noteData, CancellationToken cancellationToken);

        Task<Note> CreateNoteAsync(Note note, CancellationToken cancellationToken);

        Task EditNoteAsync(Note note, CancellationToken cancellationToken);

        Task DeleteNoteAsync(Note note, CancellationToken cancellationToken);

        bool AllNotesFetched(IEnumerable<int> requestedIds, IEnumerable<Note> fetchedNotes);

        Task DeleteNotesAsync(IEnumerable<Note> notes, CancellationToken cancellationToken);

        Task<bool> NoteCanBeMovedAsync(Note noteForMove, NoteMoveRequestDto moveRequest, CancellationToken cancellationToken);

        Task<Note> MoveNoteAsync(Note noteForMove, NoteMoveRequestDto moveRequest, CancellationToken cancellationToken);
    }
}
