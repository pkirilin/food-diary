using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;
using MediatR;

namespace FoodDiary.Application.Notes.Handlers
{
    class MoveNoteRequestHandler : IRequestHandler<MoveNoteRequest, int>
    {
        private readonly INoteRepository _noteRepository;
        private readonly INotesOrderCalculator _notesOrderCalculator;

        public MoveNoteRequestHandler(INoteRepository noteRepository, INotesOrderCalculator notesOrderCalculator)
        {
            _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
            _notesOrderCalculator = notesOrderCalculator ?? throw new ArgumentNullException(nameof(notesOrderCalculator));
        }

        public async Task<int> Handle(MoveNoteRequest request, CancellationToken cancellationToken)
        {
            var notesFromSourceMealWithoutMovedQuery = _noteRepository.GetQuery()
                .Where(n => n.PageId == request.NoteForMove.PageId)
                .Where(n => n.MealType == request.NoteForMove.MealType)
                .Where(n => n.Id != request.NoteForMove.Id);
            var notesFromDestMealWithMovedQuery = _noteRepository.GetQuery()
                .Where(n => n.PageId == request.NoteForMove.PageId)
                .Where(n => n.MealType == request.DestMeal)
                .Where(n => n.DisplayOrder >= request.Position);

            var sourceNotesForRecalculationTask = _noteRepository.GetByQueryAsync(notesFromSourceMealWithoutMovedQuery, cancellationToken);
            var destNotesForRecalculationTask = _noteRepository.GetByQueryAsync(notesFromDestMealWithMovedQuery, cancellationToken);
            
            var notesForRecalculation = await Task.WhenAll(sourceNotesForRecalculationTask, destNotesForRecalculationTask);

            var notesFromSourceMealWithoutMoved = notesForRecalculation[0];
            var notesFromDestMealWithMoved = notesForRecalculation[1];

            _notesOrderCalculator.RecalculateDisplayOrders(notesFromSourceMealWithoutMoved);
            _notesOrderCalculator.RecalculateDisplayOrders(notesFromDestMealWithMoved, request.Position);

            request.NoteForMove.MealType = request.DestMeal;
            request.NoteForMove.DisplayOrder = request.Position;
            _noteRepository.Update(request.NoteForMove);
            return await _noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
