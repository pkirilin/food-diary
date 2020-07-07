using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.API.Services.Implementation
{
    public class NotesOrderService : INotesOrderService
    {
        private readonly INoteRepository _noteRepository;

        public NotesOrderService(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
        }

        public async Task<int> GetOrderForNewNoteAsync(int pageId, MealType mealType, CancellationToken cancellationToken)
        {
            var query = _noteRepository.GetQueryWithoutTracking()
                .Where(n => n.PageId == pageId && n.MealType == mealType);

            var notes = await _noteRepository.GetListFromQueryAsync(query, cancellationToken);

            if (!notes.Any())
                return 0;

            return notes.Max(n => n.DisplayOrder) + 1;
        }

        public async Task ReorderNotesOnDeleteAsync(Note noteForDelete, CancellationToken cancellationToken)
        {
            var notesWithoutDeletedQuery = GetNotesByPageIdAndMealTypeQuery(noteForDelete.PageId, noteForDelete.MealType)
                .Where(n => n.Id != noteForDelete.Id);

            var notesWithoutDeleted = await _noteRepository.GetListFromQueryAsync(notesWithoutDeletedQuery, cancellationToken);

            RecalculateDisplayOrders(notesWithoutDeleted);
        }

        public async Task ReorderNotesOnDeleteRangeAsync(IEnumerable<Note> notesForDelete, CancellationToken cancellationToken)
        {
            var pageId = notesForDelete.Select(n => n.PageId).Distinct().First();
            var mealType = notesForDelete.Select(n => n.MealType).Distinct().First();
            var notesForDeleteIds = notesForDelete.Select(n => n.Id);

            var notesWithoutDeletedQuery = GetNotesByPageIdAndMealTypeQuery(pageId, mealType)
                .Where(n => !notesForDeleteIds.Contains(n.Id));

            var notesWithoutDeleted = await _noteRepository.GetListFromQueryAsync(notesWithoutDeletedQuery, cancellationToken);

            RecalculateDisplayOrders(notesWithoutDeleted);
        }

        public async Task ReorderNotesOnMoveAsync(Note noteForMove, NoteMoveRequest moveRequest, CancellationToken cancellationToken)
        {
            var notesFromSourceMealWithoutMovedQuery = GetNotesByPageIdAndMealTypeQuery(noteForMove.PageId, noteForMove.MealType)
                .Where(n => n.Id != noteForMove.Id);

            var notesFromDestMealWithMovedQuery = GetNotesByPageIdAndMealTypeQuery(noteForMove.PageId, moveRequest.DestMeal)
                .Where(n => n.DisplayOrder >= moveRequest.Position);

            var notesFromSourceMealWithoutMoved = await _noteRepository.GetListFromQueryAsync(notesFromSourceMealWithoutMovedQuery, cancellationToken);
            var notesFromDestMealWithMoved = await _noteRepository.GetListFromQueryAsync(notesFromDestMealWithMovedQuery, cancellationToken);

            RecalculateDisplayOrders(notesFromSourceMealWithoutMoved);
            RecalculateDisplayOrders(notesFromDestMealWithMoved, moveRequest.Position);
        }

        private IQueryable<Note> GetNotesByPageIdAndMealTypeQuery(int pageId, MealType mealType)
        {
            return _noteRepository.GetQuery()
                .Where(n => n.PageId == pageId && n.MealType == mealType)
                .OrderBy(n => n.DisplayOrder);
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
