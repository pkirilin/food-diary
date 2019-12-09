using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;

namespace FoodDiary.Infrastructure.Services
{
    public class NotesOrderService : INotesOrderService
    {
        private readonly INoteRepository _noteRepository;

        public NotesOrderService(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
        }

        public async Task<int> GetOrderForNewNoteAsync(Note note, CancellationToken cancellationToken)
        {
            var q = _noteRepository.GetQueryWithoutTracking()
                .Where(n => n.PageId == note.PageId && n.MealType == note.MealType);

            var maxDisplayOrder = await _noteRepository.GetMaxDisplayOrderFromQueryAsync(q, cancellationToken);

            return maxDisplayOrder + 1;
        }

        public async Task ReorderNotesOnDeleteAsync(Note noteForDelete, CancellationToken cancellationToken)
        {
            var notesWithoutDeleted = await GetNotesByPageIdAndMealTypeAsync(
                noteForDelete.PageId,
                noteForDelete.MealType,
                n => n.Id != noteForDelete.Id,
                cancellationToken);
            RecalculateDisplayOrders(notesWithoutDeleted);
        }

        public async Task ReorderNotesOnDeleteRangeAsync(IEnumerable<Note> notesForDelete, CancellationToken cancellationToken)
        {
            var pageId = notesForDelete.Select(n => n.PageId).Distinct().First();
            var mealType = notesForDelete.Select(n => n.MealType).Distinct().First();
            var notesForDeleteIds = notesForDelete.Select(n => n.Id);

            var notesWithoutDeleted = await GetNotesByPageIdAndMealTypeAsync(
                pageId,
                mealType,
                n => !notesForDeleteIds.Contains(n.Id),
                cancellationToken);
            RecalculateDisplayOrders(notesWithoutDeleted);
        }

        public async Task ReorderNotesOnMoveAsync(Note noteForMove, NoteMoveRequestDto moveRequest, CancellationToken cancellationToken)
        {
            // Recalculating display orders in source meal group
            var notesFromSourceMealWithoutMoved = await GetNotesByPageIdAndMealTypeAsync(
                noteForMove.PageId,
                noteForMove.MealType,
                n => n.Id != noteForMove.Id,
                cancellationToken);
            RecalculateDisplayOrders(notesFromSourceMealWithoutMoved);

            // Recalculating display orders in dest meal group
            var notesFromDestMealWithMoved = await GetNotesByPageIdAndMealTypeAsync(
                noteForMove.PageId,
                moveRequest.DestMeal,
                n => n.DisplayOrder >= moveRequest.Position,
                cancellationToken);
            RecalculateDisplayOrders(notesFromDestMealWithMoved, moveRequest.Position);
        }

        private async Task<List<Note>> GetNotesByPageIdAndMealTypeAsync(int pageId, MealType mealType, Predicate<Note> AdditinalCondition, CancellationToken cancellationToken)
        {
            var q = _noteRepository.GetQuery()
                .Where(n => n.PageId == pageId && n.MealType == mealType && AdditinalCondition(n));

            q = q.OrderBy(n => n.DisplayOrder);
            return await _noteRepository.GetListFromQueryAsync(q, cancellationToken);
        }

        private void RecalculateDisplayOrders(IEnumerable<Note> notes, int initialOrderValue = -1)
        {
            int curIndex = initialOrderValue;
            foreach (var note in notes)
                note.DisplayOrder = ++curIndex;
            _noteRepository.UpdateRange(notes);
        }
    }
}
