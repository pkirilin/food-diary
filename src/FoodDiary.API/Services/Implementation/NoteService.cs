using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.API.Services.Implementation
{
    public class NoteService : INoteService
    {
        private readonly INoteRepository _noteRepository;
        private readonly IProductRepository _productRepository;
        private readonly INotesOrderService _notesOrderService;

        public NoteService(
            INoteRepository noteRepository,
            IProductRepository productRepository,
            INotesOrderService notesOrderService)
        {
            _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _notesOrderService = notesOrderService ?? throw new ArgumentNullException(nameof(notesOrderService));
        }

        public async Task<IEnumerable<Note>> SearchNotesAsync(NotesSearchRequest request, CancellationToken cancellationToken)
        {
            var query = _noteRepository.GetQueryWithoutTracking()
                .Where(n => n.PageId == request.PageId);

            if (request.MealType.HasValue)
            {
                query = query.Where(n => n.MealType == request.MealType);
            }

            query = query.OrderBy(n => n.MealType)
                .ThenBy(n => n.DisplayOrder);
            query = _noteRepository.LoadProduct(query);

            var notes = await _noteRepository.GetListFromQueryAsync(query, cancellationToken);
            return notes;
        }

        public async Task<Note> GetNoteByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _noteRepository.GetByIdAsync(id, cancellationToken);
        }

        public async Task<IEnumerable<Note>> GetNotesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken)
        {
            return await _noteRepository.GetListFromQueryAsync(
                _noteRepository.GetQuery().Where(n => ids.Contains(n.Id)),
                cancellationToken
            );
        }

        public async Task<bool> IsNoteProductExistsAsync(int productId, CancellationToken cancellationToken)
        {
            var productForNote = await _productRepository.GetByIdAsync(productId, cancellationToken);
            return productForNote != null;
        }

        public async Task<Note> CreateNoteAsync(Note note, CancellationToken cancellationToken)
        {
            note.DisplayOrder = await _notesOrderService.GetOrderForNewNoteAsync(
                note.PageId, 
                note.MealType, 
                cancellationToken);

            var addedNote = _noteRepository.Create(note);
            await _noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return addedNote;
        }

        public async Task EditNoteAsync(Note note, CancellationToken cancellationToken)
        {
            _noteRepository.Update(note);
            await _noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteNoteAsync(Note note, CancellationToken cancellationToken)
        {
            await _notesOrderService.ReorderNotesOnDeleteAsync(note, cancellationToken);
            _noteRepository.Delete(note);
            await _noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public bool AreAllNotesFetched(IEnumerable<int> requestedIds, IEnumerable<Note> fetchedNotes)
        {
            return !requestedIds.Except(fetchedNotes.Select(n => n.Id)).Any();
        }

        public async Task DeleteNotesAsync(IEnumerable<Note> notes, CancellationToken cancellationToken)
        {
            await _notesOrderService.ReorderNotesOnDeleteRangeAsync(notes, cancellationToken);
            _noteRepository.DeleteRange(notes);
            await _noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task<bool> CanNoteBeMovedAsync(Note noteForMove, NoteMoveRequest moveRequest, CancellationToken cancellationToken)
        {
            var orderLimit = await _notesOrderService.GetOrderForNewNoteAsync(
                noteForMove.PageId, 
                moveRequest.DestMeal, 
                cancellationToken);

            return moveRequest.Position >= 0 && moveRequest.Position <= orderLimit;
        }

        public async Task<Note> MoveNoteAsync(Note noteForMove, NoteMoveRequest moveRequest, CancellationToken cancellationToken)
        {
            await _notesOrderService.ReorderNotesOnMoveAsync(noteForMove, moveRequest, cancellationToken);

            noteForMove.MealType = moveRequest.DestMeal;
            noteForMove.DisplayOrder = moveRequest.Position;

            _noteRepository.Update(noteForMove);
            await _noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return noteForMove;
        }
    }
}
