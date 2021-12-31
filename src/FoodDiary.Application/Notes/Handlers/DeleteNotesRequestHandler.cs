﻿using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;
using MediatR;

namespace FoodDiary.Application.Notes.Handlers
{
    class DeleteNotesRequestHandler : IRequestHandler<DeleteNotesRequest, int>
    {
        private readonly INoteRepository _noteRepository;
        private readonly INotesOrderCalculator _notesOrderCalculator;

        public DeleteNotesRequestHandler(INoteRepository noteRepository, INotesOrderCalculator notesOrderCalculator)
        {
            _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
            _notesOrderCalculator = notesOrderCalculator ?? throw new ArgumentNullException(nameof(notesOrderCalculator));
        }

        public async Task<int> Handle(DeleteNotesRequest request, CancellationToken cancellationToken)
        {
            var notesForDeleteIds = request.Entities.Select(n => n.Id);
            var (pageId, mealType) = request.Entities
                .Select(n => (n.PageId, n.MealType))
                .First();
            var notesWithoutDeletedQuery = _noteRepository.GetQuery()
                .Where(n => n.PageId == pageId)
                .Where(n => n.MealType == mealType)
                .Where(n => !notesForDeleteIds.Contains(n.Id));
            var notesWithoutDeleted = await _noteRepository.GetByQueryAsync(notesWithoutDeletedQuery, cancellationToken);

            _notesOrderCalculator.RecalculateDisplayOrders(notesWithoutDeleted);

            _noteRepository.RemoveRange(request.Entities);
            return await _noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
