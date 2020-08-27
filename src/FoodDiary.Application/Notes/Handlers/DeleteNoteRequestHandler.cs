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
    public class DeleteNoteRequestHandler : IRequestHandler<DeleteNoteRequest, int>
    {
        private readonly INoteRepository _noteRepository;
        private readonly INotesOrderCalculator _notesOrderCalculator;

        public DeleteNoteRequestHandler(INoteRepository noteRepository, INotesOrderCalculator notesOrderCalculator)
        {
            _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
            _notesOrderCalculator = notesOrderCalculator ?? throw new ArgumentNullException(nameof(notesOrderCalculator));
        }

        public async Task<int> Handle(DeleteNoteRequest request, CancellationToken cancellationToken)
        {
            var notesWithoutDeletedQuery = _noteRepository.GetQuery()
                .Where(n => n.PageId == request.Entity.PageId)
                .Where(n => n.MealType == request.Entity.MealType)
                .Where(n => n.Id != request.Entity.Id);
            var notesWithoutDeleted = await _noteRepository.GetListFromQueryAsync(notesWithoutDeletedQuery, cancellationToken);

            _notesOrderCalculator.RecalculateDisplayOrders(notesWithoutDeleted);

            _noteRepository.Delete(request.Entity);
            return await _noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}
