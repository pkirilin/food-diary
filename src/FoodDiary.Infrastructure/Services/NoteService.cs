using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;

namespace FoodDiary.Infrastructure.Services
{
    public class NoteService : INoteService
    {
        private readonly INoteRepository _noteRepository;

        public NoteService(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository;
        }

        public async Task<Note> GetNoteByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _noteRepository.GetByIdAsync(id, cancellationToken);
        }

        public async Task<IEnumerable<Note>> GetNotesByPageIdAsync(int pageId, CancellationToken cancellationToken)
        {
            return await _noteRepository.GetByPageIdAsync(pageId, cancellationToken);
        }

        public async Task<IEnumerable<Note>> GetNotesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken)
        {
            return await _noteRepository.GetListFromQueryAsync(
                _noteRepository.GetQuery().Where(n => ids.Contains(n.Id)),
                cancellationToken
            );
        }

        public async Task<bool> IsNoteDataValidAsync(NoteCreateEditDto noteData)
        {
            // TODO: add checking product
            return true;
        }

        public async Task<Note> CreateNoteAsync(Note note, CancellationToken cancellationToken)
        {
            return await _noteRepository.CreateAsync(note, cancellationToken);
        }

        public async Task<Note> EditNoteAsync(Note note, CancellationToken cancellationToken)
        {
            return await _noteRepository.UpdateAsync(note, cancellationToken);
        }

        public async Task<Note> DeleteNoteAsync(Note note, CancellationToken cancellationToken)
        {
            return await _noteRepository.DeleteAsync(note, cancellationToken);
        }

        public bool AllNotesFetched(IEnumerable<int> requestedIds, IEnumerable<Note> fetchedNotes)
        {
            return !requestedIds.Except(fetchedNotes.Select(n => n.Id)).Any();
        }

        public async Task DeleteNotesAsync(IEnumerable<Note> notes, CancellationToken cancellationToken)
        {
            await _noteRepository.DeleteRangeAsync(notes, cancellationToken);
        }

        public async Task<Note> MoveNoteAsync(NoteMoveRequestDto moveRequest, CancellationToken cancellationToken)
        {
            throw new System.NotImplementedException();
        }
    }
}
