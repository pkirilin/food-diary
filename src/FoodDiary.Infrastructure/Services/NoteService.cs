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
        private readonly INotesOrderService _notesOrderService;

        public NoteService(INoteRepository noteRepository, INotesOrderService notesOrderService)
        {
            _noteRepository = noteRepository;
            _notesOrderService = notesOrderService;
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

        public async Task<bool> IsNoteDataValidAsync(NoteCreateEditDto noteData, CancellationToken cancellationToken)
        {
            // TODO: add checking product
            return true;
        }

        public async Task<Note> CreateNoteAsync(Note note, CancellationToken cancellationToken)
        {
            note.DisplayOrder = await _notesOrderService.GetOrderForNewNoteAsync(note, cancellationToken);
            var addedNote = _noteRepository.Create(note);
            await _noteRepository.SaveChangesAsync(cancellationToken);
            return addedNote;
        }

        public async Task<Note> EditNoteAsync(Note note, CancellationToken cancellationToken)
        {
            var updatedNote = _noteRepository.Update(note);
            await _noteRepository.SaveChangesAsync(cancellationToken);
            return updatedNote;
        }

        public async Task<Note> DeleteNoteAsync(Note note, CancellationToken cancellationToken)
        {
            await _notesOrderService.ReorderNotesOnDeleteAsync(note, cancellationToken);
            var deletedNote = _noteRepository.Delete(note);
            await _noteRepository.SaveChangesAsync(cancellationToken);
            return deletedNote;
        }

        public bool AllNotesFetched(IEnumerable<int> requestedIds, IEnumerable<Note> fetchedNotes)
        {
            return !requestedIds.Except(fetchedNotes.Select(n => n.Id)).Any();
        }

        public async Task DeleteNotesAsync(IEnumerable<Note> notes, CancellationToken cancellationToken)
        {
            await _notesOrderService.ReorderNotesOnDeleteRangeAsync(notes, cancellationToken);
            _noteRepository.DeleteRange(notes);
            await _noteRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> NoteCanBeMovedAsync(Note noteForMove, NoteMoveRequestDto moveRequest, CancellationToken cancellationToken)
        {
            var q = _noteRepository.GetQueryWithoutTracking()
                .Where(n => n.PageId == noteForMove.PageId && n.MealType == moveRequest.DestMeal);
            var maxDisplayOrder = await _noteRepository.GetMaxDisplayOrderFromQueryAsync(q, cancellationToken);
            return moveRequest.Position >= 0 && moveRequest.Position <= maxDisplayOrder + 1;
        }

        public async Task<Note> MoveNoteAsync(Note noteForMove, NoteMoveRequestDto moveRequest, CancellationToken cancellationToken)
        {
            await _notesOrderService.ReorderNotesOnMoveAsync(noteForMove, moveRequest, cancellationToken);

            noteForMove.MealType = moveRequest.DestMeal;
            noteForMove.DisplayOrder = moveRequest.Position;

            var movedNote = _noteRepository.Update(noteForMove);
            await _noteRepository.SaveChangesAsync(cancellationToken);
            return movedNote;
        }
    }
}
